from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewSubmitRequest,
)
from app.services.interview import get_interview_questions, get_title
from app.services.authority import AuthorityRouter
from app.services.ai import build_ai_provider
from app.models.schemas import DraftRequest

router = APIRouter()

VALID_TYPES = {"rti", "consumer_complaint", "grievance", "appeal"}


@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    draft_type = request.draft_type.lower().strip()
    if draft_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"draft_type must be one of: {', '.join(sorted(VALID_TYPES))}")
    if not request.case_summary or not request.case_summary.strip():
        raise HTTPException(status_code=400, detail="case_summary is required to personalise the interview.")

    questions = get_interview_questions(draft_type)
    return InterviewStartResponse(
        interview_id=str(uuid4()),
        draft_type=draft_type,
        title=get_title(draft_type),
        questions=questions,
    )


@router.post("/interview/submit")
async def submit_interview(request: InterviewSubmitRequest):
    draft_type = request.draft_type.lower().strip()
    if draft_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"draft_type must be one of: {', '.join(sorted(VALID_TYPES))}")
    if not request.case_summary or not request.case_summary.strip():
        raise HTTPException(status_code=400, detail="case_summary is required.")

    answers = {k: str(v).strip() for k, v in (request.answers or {}).items() if str(v).strip()}
    required_keys = {
        q.field_key
        for q in get_interview_questions(draft_type)
        if q.required
    }
    missing_required = sorted(required_keys - set(answers.keys()))
    if missing_required:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required answers: {', '.join(missing_required)}",
        )

    target_authority = request.target_authority or answers.get("office_addressed") or None
    draft_request = DraftRequest(
        draft_type=draft_type,
        case_summary=request.case_summary.strip(),
        user_details=answers,
        target_authority=target_authority or AuthorityRouter.route(draft_type_to_category(draft_type), request.case_summary).authority_name,
        specific_demands=request.specific_demands,
    )

    provider = build_ai_provider()
    return await provider.generate_draft(draft_request)


def draft_type_to_category(draft_type: str) -> str:
    return {
        "rti": "rti",
        "consumer_complaint": "consumer",
        "grievance": "other",
        "appeal": "notice",
    }.get(draft_type, "other")
