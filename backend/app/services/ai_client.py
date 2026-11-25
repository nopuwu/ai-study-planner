"""Asynchroniczny klient API zgodnego z OpenAI Chat Completions.

Zakres issue #17: żądania, limity czasu, ponowienia i sekrety z konfiguracji.
Rejestrowanie generowań oraz walidacja promptów należą do osobnych zadań.
"""

import asyncio
from dataclasses import dataclass
from typing import Awaitable, Callable

import httpx


class AIClientError(RuntimeError):
    """Bezpieczny dla logów opis niepowodzenia wywołania modelu."""


@dataclass(frozen=True)
class AIResult:
    text: str
    model: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None


class AIClient:
    RETRYABLE_STATUSES = frozenset({408, 429, 500, 502, 503, 504})

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        base_url: str = "https://api.openai.com/v1",
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
        transport: httpx.AsyncBaseTransport | None = None,
        sleeper: Callable[[float], Awaitable[None]] = asyncio.sleep,
    ) -> None:
        if not api_key.strip():
            raise ValueError("Brak klucza AI_API_KEY")
        if not model.strip():
            raise ValueError("Brak nazwy modelu AI_MODEL")
        if timeout_seconds <= 0:
            raise ValueError("Timeout musi być dodatni")
        if not 0 <= max_retries <= 5:
            raise ValueError("max_retries musi należeć do zakresu 0..5")
        if not base_url.startswith(("https://", "http://")):
            raise ValueError("AI_API_BASE_URL musi mieć schemat http lub https")

        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._max_retries = max_retries
        self._transport = transport
        self._sleeper = sleeper

    @classmethod
    def from_settings(cls) -> "AIClient":
        """Pobiera ustawienia backendu (w tym klucz) wyłącznie z konfiguracji."""
        from app.core.config import settings

        return cls(
            api_key=settings.ai_api_key,
            model=settings.ai_model,
            base_url=settings.ai_api_base_url,
            timeout_seconds=settings.ai_timeout_seconds,
            max_retries=settings.ai_max_retries,
        )

    async def generate(self, prompt: str) -> AIResult:
        """Generuje odpowiedź; maksymalnie max_retries+1 prób.

        Uwaga: ponowienie po timeout może oznaczać, że dostawca policzy
        dwa wywołania. Limity wydatków i rejestracja należą do issue #18.
        """
        if not isinstance(prompt, str) or not prompt.strip():
            raise ValueError("Prompt nie może być pusty")

        url = f"{self._base_url}/chat/completions"
        payload = {
            "model": self._model,
            "messages": [{"role": "user", "content": prompt}],
        }
        headers = {"Authorization": f"Bearer {self._api_key}"}

        async with httpx.AsyncClient(
            transport=self._transport,
            timeout=httpx.Timeout(self._timeout_seconds),
            follow_redirects=False,
        ) as http:
            for attempt in range(self._max_retries + 1):
                try:
                    # Ograniczenie czasu CAŁEGO żądania, nie tylko faz sieciowych.
                    async with asyncio.timeout(self._timeout_seconds):
                        response = await http.post(url, headers=headers, json=payload)
                except (TimeoutError, httpx.TimeoutException, httpx.NetworkError):
                    if attempt == self._max_retries:
                        raise AIClientError("Żądanie AI nie powiodło się po ponowieniach (sieć/timeout)") from None
                    await self._sleeper(min(0.5 * (2**attempt), 8.0))
                    continue

                if response.status_code in self.RETRYABLE_STATUSES:
                    if attempt == self._max_retries:
                        raise AIClientError(
                            f"Dostawca AI zwrócił HTTP {response.status_code} po ponowieniach"
                        )
                    await self._sleeper(self._retry_delay(response, attempt))
                    continue

                if response.status_code >= 400:
                    # Bez surowej odpowiedzi: mogłaby zawierać szczegóły lub dane użytkownika.
                    raise AIClientError(f"Dostawca AI odrzucił żądanie: HTTP {response.status_code}")

                try:
                    body = response.json()
                    content = body["choices"][0]["message"]["content"]
                    if not isinstance(content, str) or not content.strip():
                        raise ValueError("Pusta odpowiedź")
                    usage = body.get("usage") or {}
                    return AIResult(
                        text=content,
                        model=str(body.get("model") or self._model),
                        prompt_tokens=usage.get("prompt_tokens"),
                        completion_tokens=usage.get("completion_tokens"),
                        total_tokens=usage.get("total_tokens"),
                    )
                except (KeyError, IndexError, TypeError, ValueError, AttributeError):
                    raise AIClientError("Nieprawidłowy format odpowiedzi API modelu") from None

        raise AIClientError("Nieznany błąd klienta AI")

    @staticmethod
    def _retry_delay(response: httpx.Response, attempt: int) -> float:
        fallback = min(0.5 * (2**attempt), 8.0)
        if response.status_code != 429:
            return fallback
        try:
            return min(max(float(response.headers.get("Retry-After", "")), 0.0), 8.0)
        except ValueError:
            return fallback
