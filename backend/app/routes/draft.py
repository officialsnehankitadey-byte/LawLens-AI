from fastapi import APIRouter
from app.config import settings
from app.models.schemas import DraftRequest, DraftResponse
from app.services.ai.gemini import GeminiProvider
from app.services.ai.fallback import FallbackProvider

router = APIRouter()

def get_ai_provider():
    if settings.GEMINI_API_KEY:
        return GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
    return FallbackProvider()

@router.post("/draft/generate", response_model=DraftResponse)
async def generate_draft(request: DraftRequest):
    provider = get_ai_provider()
    return await provider.generate_draft(request)
