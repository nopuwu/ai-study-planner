# Dokumentacja

Tu zbieramy dokumenty projektu SPL. Pliki dodajemy w miarę postępu prac.

## Planowana zawartość

| Dokument | Zadanie | Status |
| --- | --- | --- |
| Założenia i wymagania systemu | issue #1 | do zrobienia |
| Diagram ERD i model bazy danych | issue #2 | do zrobienia |
| Opis architektury | krok 2 projektu | do zrobienia |
| Prezentacje na zajęcia | – | do zrobienia |

## Prezentacje

Nazwa pliku ma postać `Nazwa_kodowa_projektu-Y-Nazwisko_PM`, np. `SPL-2-Grech-Wór.pptx`. Przy kolejnych terminach numer `Y` rośnie o 1.

## Konfiguracja API modelu AI (Groq)

Aplikacja wykorzystuje zewnętrzny model językowy za pośrednictwem API platformy **Groq**. Komunikacja z modelem odbywa się wyłącznie po stronie backendu FastAPI.

Do korzystania z funkcji generowania AI wymagany jest klucz API.

### 1. Uzyskanie klucza API

Każdy członek zespołu może wygenerować własny klucz API:

1. Wejdź na [GroqCloud Console](https://console.groq.com/keys).
2. Zaloguj się lub utwórz konto.
3. Przejdź do sekcji **API Keys**.
4. Wygeneruj nowy klucz i skopiuj jego wartość.

Groq oferuje darmowy plan z ograniczeniami dotyczącymi liczby zapytań i wykorzystywanych tokenów.

**Alternatywnie:** jeśli nie chcesz zakładać własnego konta, skontaktuj się ze mną w sprawie uzyskania dostępu do API wykorzystywanego w projekcie.

### 2. Konfiguracja środowiska

W głównym katalogu repozytorium utwórz plik `.env` na podstawie `.env.example`, jeśli jeszcze go nie masz.

W PowerShell:

```powershell
Copy-Item .env.example .env
```

Następnie uzupełnij zmienne dotyczące modelu AI:

```dotenv
AI_API_KEY=twoj_klucz_api
AI_API_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-20b
AI_TIMEOUT_SECONDS=30
AI_MAX_RETRIES=2
```

Pozostałe zmienne środowiskowe, m.in. konfigurację PostgreSQL i JWT, należy pozostawić zgodnie z instrukcją uruchamiania projektu.

### 3. Uruchomienie aplikacji

Po zapisaniu konfiguracji uruchom:

```powershell
docker compose up -d --build
```

Jeżeli kontenery są już uruchomione, a zmieniono wyłącznie konfigurację API, można odtworzyć kontener backendu:

```powershell
docker compose up -d --force-recreate backend
```

### 4. Bezpieczeństwo kluczy API

- Nigdy nie umieszczaj prawdziwego klucza API w kodzie źródłowym ani w pliku `.env.example`.
- Plik `.env` jest wykluczony z repozytorium przez `.gitignore`.
- Klucze API nie mogą być przesyłane w commitach ani Pull Requestach.
- Współdzielone klucze należy przekazywać wyłącznie przez uzgodniony, bezpieczny kanał, najlepiej menedżer sekretów.
- Wykorzystywanie wspólnego klucza oznacza współdzielenie limitów API między członkami zespołu.

**Uwaga:** bez poprawnego klucza API funkcje generowania AI nie będą dostępne. Pozostałe funkcjonalności aplikacji mogą działać niezależnie od dostawcy modelu.