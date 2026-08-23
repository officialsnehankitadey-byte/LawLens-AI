"""
AI Provider Services Package

Provider chain: Gemini (primary) -> Groq (secondary failover) -> Fallback (deterministic demo).
"""


def build_ai_provider():
    """
    Build the AI provider chain from configured API keys.

    - If GEMINI_API_KEY is set, Gemini is the primary provider and Groq (if
      configured) is attached as the secondary failover for quota/rate-limit
      exhaustion.
    - If only GROQ_API_KEY is set, Groq is used directly.
    - If neither key is set, the deterministic FallbackProvider runs demo mode.
    """
    from app.config import settings

    groq_provider = None
    if settings.GROQ_API_KEY:
        from app.services.ai.groq import GroqProvider
        groq_provider = GroqProvider(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)

    if settings.GEMINI_API_KEY:
        from app.services.ai.gemini import GeminiProvider
        gemini_provider = GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
        gemini_provider.secondary = groq_provider
        return gemini_provider

    if groq_provider is not None:
        return groq_provider

    from app.services.ai.fallback import FallbackProvider
    return FallbackProvider()
