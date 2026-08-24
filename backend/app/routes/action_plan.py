from fastapi import APIRouter
from typing import Optional
from app.models.schemas import ActionPlan, ActionStep

router = APIRouter()


@router.post("/action-plan/generate", response_model=ActionPlan)
async def generate_action_plan(data: dict):
    # Extract relevant info from input to customize the plan
    issue = data.get("issue", "the reported issue")
    category = data.get("category", "general")
    target_authority = data.get("target_authority")
    timeline = data.get("timeline")
    documents = data.get("documents", ["Invoice", "Proof of Communication", "Identity Document"])

    return ActionPlan(
        immediate_action=f"Gather all documentation related to {issue}.",
        ordered_steps=[
            ActionStep(
                step_number=1,
                title="Verify Documentation",
                description=f"Ensure all evidence for {issue} is organized and accessible.",
                why_it_matters="Well-documented cases resolve faster and have stronger legal standing.",
            ),
            ActionStep(
                step_number=2,
                title="Submit Formal Complaint",
                description=f"File a {category} complaint with the appropriate authority using the generated draft.",
                why_it_matters="Initiates formal government or administrative action on your issue.",
            )
        ],
        required_documents=documents,
        target_authority=target_authority or "Concerned Grievance Redressal Authority",
        expected_timeline=timeline or "7-15 business days",
        warnings=["Check filing deadline limitations for your specific issue type."]
    )
