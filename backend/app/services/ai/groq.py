import logging

import httpx

from app.services.ai.gemini import GeminiProvider
from app.services.ai.fallback import FallbackProvider

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqProvider(GeminiProvider):
    """
    Groq AI Provider using Groq's OpenAI-compatible chat completions API.

    Inherits prompt construction, JSON parsing, and fallback behaviour from
    GeminiProvider; only overrides the low-level text generation call and
    availability check.
    """

    def __init__(self, api_key: str, model_name: str = "openai/gpt-oss-120b"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = FallbackProvider()
        self.secondary = None
        logger.info(f"Groq provider initialized with model: {model_name}")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _complete(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are LawLens AI, a civic and legal assistant for Indian "
                        "citizens. Follow the user's output format instructions exactly."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }
        response = httpx.post(GROQ_API_URL, headers=headers, json=payload, timeout=90)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
