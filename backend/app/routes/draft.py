import logging
from fastapi import APIRouter
from app.models.schemas import DraftRequest, DraftResponse
from app.services.ai import build_ai_provider
from app.services.authority import AuthorityRouter

logger = logging.getLogger(__name__)
router = APIRouter()


def draft_type_to_category(draft_type: str) -> str:
    return {
        "rti": "rti",
        "consumer_complaint": "consumer",
        "grievance": "other",
        "appeal": "notice",
    }.get(draft_type.lower(), "other")


@router.post("/draft/generate", response_model=DraftResponse)
async def generate_draft(request: DraftRequest):
    if not request.target_authority:
        try:
            routing = AuthorityRouter.route(
                draft_type_to_category(request.draft_type),
                request.case_summary,
            )
            request.target_authority = routing.authority_name
        except Exception as e:
            logger.warning(f"Authority routing failed: {e}")
    provider = build_ai_provider()
    return await provider.generate_draft(request)
