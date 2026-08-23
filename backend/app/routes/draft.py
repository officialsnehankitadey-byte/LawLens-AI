from fastapi import APIRouter
from app.models.schemas import DraftRequest, DraftResponse
from app.services.ai import build_ai_provider
from app.services.authority import AuthorityRouter

router = APIRouter()


@router.post("/draft/generate", response_model=DraftResponse)
async def generate_draft(request: DraftRequest):
    if not request.target_authority:
        try:
            category_map = {
                "rti": "rti",
                "consumer_complaint": "consumer",
                "grievance": "other",
                "appeal": "notice",
            }
            routing = AuthorityRouter.route(
                category_map.get(request.draft_type.lower(), "other"),
                request.case_summary,
            )
            request.target_authority = routing.authority_name
        except Exception:
            pass
    provider = build_ai_provider()
    return await provider.generate_draft(request)
