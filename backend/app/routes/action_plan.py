from fastapi import APIRouter
from app.models.schemas import ActionPlan, ActionStep

router = APIRouter()

@router.post("/action-plan/generate", response_model=ActionPlan)
async def generate_action_plan(data: dict):
    return ActionPlan(
        immediate_action="Collect all relevant communication, receipts, and order proofs.",
        ordered_steps=[
            ActionStep(
                step_number=1,
                title="Verify Documentation",
                description="Ensure invoices and photo evidence are stored securely.",
                why_it_matters="Serves as primary evidence during grievance resolution."
            ),
            ActionStep(
                step_number=2,
                title="Submit Formal Complaint",
                description="Use the generated draft to file a complaint with the authority.",
                why_it_matters="Initiates formal government or administrative action."
            )
        ],
        required_documents=["Invoice", "Proof of Communication", "Identity Document"],
        target_authority="Concerned Grievance Redressal Authority",
        expected_timeline="7-15 business days",
        warnings=["Check filing deadline limitations."]
    )
