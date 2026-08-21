from fastapi import APIRouter
from app.models.schemas import SchemeCheckRequest, SchemeCheckResponse

router = APIRouter()

@router.post("/schemes/check", response_model=SchemeCheckResponse)
async def check_scheme(request: SchemeCheckRequest):
    return SchemeCheckResponse(
        scheme_name=request.scheme_name,
        known_criteria=["Minimum Age: 18", "Resident Status", "Income Threshold Criteria"],
        missing_information=["State residency proof", "Income Certificate"],
        eligible_assessment="Likely Eligible (Pending documentation)",
        required_documents=["Aadhaar Card", "Income Certificate", "Bank Passbook Copy"],
        next_action="Gather missing documents and submit application on official portal.",
        source_url="https://myscheme.gov.in"
    )
