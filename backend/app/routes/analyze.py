from fastapi import APIRouter, HTTPException
from app.config import settings
from app.models.schemas import ProblemRequest, SituationAnalysisResponse
from app.services.ai.gemini import GeminiProvider
from app.services.ai.fallback import FallbackProvider

router = APIRouter()

def get_ai_provider():
    if settings.GEMINI_API_KEY:
        return GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
    return FallbackProvider()

@router.post("/analyze/problem", response_model=SituationAnalysisResponse)
async def analyze_problem(request: ProblemRequest):
    if not request.problem or not request.problem.strip():
        raise HTTPException(status_code=400, detail="Problem description cannot be empty.")
    provider = get_ai_provider()
    return await provider.analyze_problem(request)
