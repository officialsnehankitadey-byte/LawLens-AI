from abc import ABC, abstractmethod
from app.models.schemas import ProblemRequest, SituationAnalysisResponse, DocumentAnalysisResponse, DraftRequest, DraftResponse

class AIProvider(ABC):
    """
    Abstract AI Provider Interface decoupling Gemini / Fallback implementations.
    """
    @abstractmethod
    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        pass

    @abstractmethod
    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        pass

    @abstractmethod
    async def generate_draft(self, request: DraftRequest) -> DraftResponse:
        pass
