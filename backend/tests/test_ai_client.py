"""Testy klienta bez połączeń z dostawcą AI i bez prawdziwego klucza."""

import unittest

import httpx

from app.services.ai_client import AIClient, AIClientError


class TestAIClient(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.delays = []

        async def fake_sleep(delay):
            self.delays.append(delay)

        self.fake_sleep = fake_sleep

    def make_client(self, handler, **kwargs):
        return AIClient(
            api_key="FAKE_KEY_FOR_TESTS",
            model="mock-model",
            base_url="https://mock.example/v1",
            transport=httpx.MockTransport(handler),
            sleeper=self.fake_sleep,
            **kwargs,
        )

    async def test_success_and_usage(self):
        def handle(request):
            self.assertEqual(request.url.path, "/v1/chat/completions")
            self.assertEqual(request.headers["Authorization"], "Bearer FAKE_KEY_FOR_TESTS")
            return httpx.Response(200, json={
                "model": "mock-model",
                "choices": [{"message": {"content": "Gotowe"}}],
                "usage": {"prompt_tokens": 3, "completion_tokens": 2, "total_tokens": 5},
            })

        result = await self.make_client(handle).generate("Utwórz plan")
        self.assertEqual(result.text, "Gotowe")
        self.assertEqual(result.total_tokens, 5)
        self.assertEqual(self.delays, [])

    async def test_retry_after_429(self):
        calls = 0

        def handle(_request):
            nonlocal calls
            calls += 1
            if calls == 1:
                return httpx.Response(429, headers={"Retry-After": "1"})
            return httpx.Response(200, json={"choices": [{"message": {"content": "OK"}}]})

        result = await self.make_client(handle).generate("Test")
        self.assertEqual(result.text, "OK")
        self.assertEqual(calls, 2)
        self.assertEqual(self.delays, [1.0])

    async def test_retry_network_timeout(self):
        calls = 0

        def handle(request):
            nonlocal calls
            calls += 1
            if calls == 1:
                raise httpx.ReadTimeout("simulated timeout", request=request)
            return httpx.Response(200, json={"choices": [{"message": {"content": "OK"}}]})

        self.assertEqual((await self.make_client(handle).generate("Test")).text, "OK")
        self.assertEqual(calls, 2)

    async def test_401_does_not_retry_or_leak_key(self):
        calls = 0

        def handle(_request):
            nonlocal calls
            calls += 1
            return httpx.Response(401, json={"detail": "not authorized"})

        with self.assertRaises(AIClientError) as caught:
            await self.make_client(handle).generate("Test")
        self.assertEqual(calls, 1)
        self.assertEqual(self.delays, [])
        self.assertNotIn("FAKE_KEY", str(caught.exception))

    async def test_503_retry_limit(self):
        calls = 0

        def handle(_request):
            nonlocal calls
            calls += 1
            return httpx.Response(503)

        with self.assertRaisesRegex(AIClientError, "HTTP 503"):
            await self.make_client(handle, max_retries=2).generate("Test")
        self.assertEqual(calls, 3)
        self.assertEqual(len(self.delays), 2)

    async def test_invalid_answer(self):
        def handle(_request):
            return httpx.Response(200, json={"choices": []})

        with self.assertRaises(AIClientError):
            await self.make_client(handle).generate("Test")

    async def test_empty_prompt(self):
        def handle(_request):
            self.fail("No HTTP call expected")

        with self.assertRaises(ValueError):
            await self.make_client(handle).generate("  ")


if __name__ == "__main__":
    unittest.main()
