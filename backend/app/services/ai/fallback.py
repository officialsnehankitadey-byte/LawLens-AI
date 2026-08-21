import uuid
import json
import os
from app.services.ai.base import AIProvider
from app.models.schemas import (
    ProblemRequest, SituationAnalysisResponse, RightOrSchemeItem,
    ActionPlan, ActionStep, SourceReference, DocumentAnalysisResponse, ExtractedFact,
    DraftRequest, DraftResponse
)

class FallbackProvider(AIProvider):
    """
    Deterministic Fallback & Demo Provider for offline / API key-less operations.
    Guarantees LawLens works continuously without external API availability.
    """
    def __init__(self):
        sample_path = os.path.join(os.path.dirname(__file__), "../../knowledge/sample_data.json")
        self.sample_data = {}
        if os.path.exists(sample_path):
            try:
                with open(sample_path, "r", encoding="utf-8") as f:
                    self.sample_data = json.load(f).get("demo_scenarios", {})
            except Exception:
                self.sample_data = {}

    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        cat = request.category.lower() if request.category else "consumer"
        data = self.sample_data.get(cat, self.sample_data.get("consumer"))

        if data:
            rights = [RightOrSchemeItem(**item) for item in data["applicable_rights_or_schemes"]]
            steps = [ActionStep(**s) for s in data["action_plan"]["ordered_steps"]]
            plan = ActionPlan(
                immediate_action=data["action_plan"]["immediate_action"],
                ordered_steps=steps,
                required_documents=data["action_plan"]["required_documents"],
                target_authority=data["action_plan"].get("target_authority"),
                expected_timeline=data["action_plan"].get("expected_timeline"),
                warnings=data["action_plan"].get("warnings", [])
            )
            sources = [SourceReference(**s) for s in data.get("sources", [])]

            return SituationAnalysisResponse(
                id=str(uuid.uuid4()),
                situation_summary=f"[Demo Analysis] {request.problem[:120]}...",
                detected_issue=data["detected_issue"],
                category=request.category,
                applicable_rights_or_schemes=rights,
                action_plan=plan,
                recommended_draft_type=data.get("recommended_draft_type", "consumer_complaint"),
                sources=sources,
                disclaimer=data["disclaimer"],
                is_demo=True
            )
        
        # Generic fallback
        return SituationAnalysisResponse(
            id=str(uuid.uuid4()),
            situation_summary=f"Analysis of situation: {request.problem}",
            detected_issue="Civic/Government Service Inquiry",
            category=request.category,
            applicable_rights_or_schemes=[
                RightOrSchemeItem(
                    topic="General Right to Grievance Redressal",
                    explanation="Citizens have the right to file formal representations or grievances to responsible public authorities.",
                    relevance_reason="Applies to general administrative and civic inquiries.",
                    action_recommended="Draft a formal representation letter."
                )
            ],
            action_plan=ActionPlan(
                immediate_action="Gather all facts, dates, and documentation regarding your issue.",
                ordered_steps=[
                    ActionStep(
                        step_number=1,
                        title="Document Key Events",
                        description="Write down a chronological timeline of events and relevant dates.",
                        why_it_matters="Essential for providing clear context when contacting officials."
                    ),
                    ActionStep(
                        step_number=2,
                        title="Identify Relevant Authority",
                        description="Determine the appropriate local, state, or central department.",
                        why_it_matters="Ensures your submission reaches the decision-making authority."
                    )
                ],
                required_documents=["Proof of Identity", "Written Summary of Issue", "Supporting Notices/Receipts"]
            ),
            recommended_draft_type="grievance",
            disclaimer="Fallback Demo Mode: This response is generated deterministically for testing without API keys.",
            is_demo=True
        )

    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        return DocumentAnalysisResponse(
            id=str(uuid.uuid4()),
            filename=filename,
            document_type="Civic / Official Document",
            summary=f"Extracted content summary for uploaded file '{filename}' ({len(content)} characters parsed).",
            extracted_facts=[
                ExtractedFact(fact=f"Document uploaded: {filename}", confidence="high"),
                ExtractedFact(fact="Document text extracted successfully", confidence="high")
            ],
            explicit_dates=["2026-08-20"],
            explicit_deadlines=["Within 15 days of notice receipt"],
            identified_issues=["Pending Action / Verification Required"],
            recommended_actions=["Review key facts", "Prepare draft response if required"],
            recommended_draft_type="appeal",
            is_demo=True
        )

    async def generate_draft(self, request: DraftRequest) -> DraftResponse:
        title_map = {
            "rti": "Application under Right to Information Act, 2005",
            "consumer_complaint": "Formal Consumer Grievance / Legal Notice",
            "grievance": "Representation / Official Civic Grievance",
            "appeal": "First Appeal / Formal Representation"
        }
        title = title_map.get(request.draft_type.lower(), "Official Civic Representation")

        template = f"""To,
[The Public Information Officer / Concerned Authority]
[Department / Office Name]
[Address / Location]

Subject: {title}

Sir/Madam,

I am writing regarding the following issue:
{request.case_summary}

KEY PARTICULARS:
- Date of Issue: [Insert Date]
- Reference / Order Number: [Insert Reference Number, if applicable]

REQUEST / DEMAND:
1. Provide clear status / resolution regarding the above stated matter.
2. Provide copies of official sanction letters or relevant departmental notes.

Thank you.

Yours faithfully,
[Your Full Name]
[Your Contact Address]
[Your Mobile Number / Email]
Date: [Current Date]
"""
        return DraftResponse(
            draft_id=str(uuid.uuid4()),
            draft_type=request.draft_type,
            title=title,
            content=template,
            placeholders_used=["[The Public Information Officer / Concerned Authority]", "[Department / Office Name]", "[Your Full Name]", "[Your Contact Address]"],
            editable=True,
            disclaimer="Demo Draft: Please fill in all bracketed placeholders before submitting."
        )
