from fastapi import APIRouter
from app.config import settings
from app.models.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    has_key = bool(settings.GEMINI_API_KEY)
    ai_provider = "Google Gemini API" if has_key else "Fallback Demo Provider"
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        ai_provider=ai_provider,
        api_key_configured=has_key
    )
