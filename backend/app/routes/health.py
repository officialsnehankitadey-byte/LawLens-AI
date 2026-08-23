from fastapi import APIRouter
from app.config import settings
from app.models.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    if settings.GEMINI_API_KEY and settings.GROQ_API_KEY:
        ai_provider = f"Google Gemini API ({settings.GEMINI_MODEL}) + Groq failover ({settings.GROQ_MODEL})"
        has_key = True
    elif settings.GEMINI_API_KEY:
        ai_provider = f"Google Gemini API ({settings.GEMINI_MODEL})"
        has_key = True
    elif settings.GROQ_API_KEY:
        ai_provider = f"Groq API ({settings.GROQ_MODEL})"
        has_key = True
    else:
        ai_provider = "Fallback Demo Provider"
        has_key = False
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        ai_provider=ai_provider,
        api_key_configured=has_key
    )
