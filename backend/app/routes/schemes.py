from fastapi import APIRouter

from app.models.schemas import SchemeCheckRequest, SchemeCheckResponse
from app.services.ai import build_ai_provider

router = APIRouter()


@router.post("/schemes/check", response_model=SchemeCheckResponse)
async def check_scheme(request: SchemeCheckRequest):
    if not request.scheme_name or not request.scheme_name.strip():
        return SchemeCheckResponse(
            scheme_name=request.scheme_name,
            verdict="needs_info",
            plain_language_summary="Please provide the name of the government scheme you want to check.",
            known_criteria=[],
            missing_information=["Scheme name"],
            eligible_assessment="Cannot determine yet — more information needed.",
            required_documents=[],
            next_action="Enter the scheme name (e.g. PM Awas Yojana, Ayushman Bharat) and your details.",
            source_url="https://myscheme.gov.in",
            is_demo=True,
        )

    provider = build_ai_provider()
    return await provider.check_scheme_eligibility(request)
