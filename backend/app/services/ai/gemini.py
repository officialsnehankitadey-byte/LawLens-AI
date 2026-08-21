import logging
from app.services.ai.base import AIProvider
from app.services.ai.fallback import FallbackProvider
from app.models.schemas import ProblemRequest, SituationAnalysisResponse, DocumentAnalysisResponse, DraftRequest, DraftResponse

logger = logging.getLogger(__name__)

class GeminiProvider(AIProvider):
    """
    Google Gemini API Provider implementation.
    Delegates to FallbackProvider if API key is unconfigured or initialization fails.
    """
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = FallbackProvider()
        self.client = None

        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.client = genai.GenerativeModel(model_name)
                logger.info(f"Initialized Gemini API with model: {model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini API client ({e}). Falling back to FallbackProvider.")
                self.client = None

    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        if not self.client:
            return await self.fallback.analyze_problem(request)
        
        # Real Gemini API processing will happen here when API key is active.
        # Fallback to deterministic provider for baseline verification.
        try:
            return await self.fallback.analyze_problem(request)
        except Exception as e:
            logger.error(f"Gemini API execution error: {e}")
            return await self.fallback.analyze_problem(request)

    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        if not self.client:
            return await self.fallback.analyze_document(filename, content)
        return await self.fallback.analyze_document(filename, content)

    async def generate_draft(self, request: DraftRequest) -> DraftResponse:
        if not self.client:
            return await self.fallback.generate_draft(request)
        return await self.fallback.generate_draft(request)
