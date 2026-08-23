import uuid
import json
import os
from app.services.ai.base import AIProvider
from app.models.schemas import (
    ProblemRequest, SituationAnalysisResponse, RightOrSchemeItem,
    ActionPlan, ActionStep, SourceReference, DocumentAnalysisResponse, ExtractedFact,
    DraftRequest, DraftResponse,
    SchemeCheckRequest, SchemeCheckResponse
)

from app.services.document.analyzer import DocumentAnalyzer

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
        """Deterministic fallback analysis using only the user's problem description.
        No demo data is used."""
        summary = f"Analysis of situation: {request.problem[:200]}"
        return SituationAnalysisResponse(
            id=str(uuid.uuid4()),
            situation_summary=summary,
            detected_issue="Civic/Government Service Inquiry",
            category=request.category,
            applicable_rights_or_schemes=[],
            action_plan=ActionPlan(
                immediate_action="Gather all facts, dates, and documentation regarding your issue.",
                ordered_steps=[],
                required_documents=[]
            ),
            recommended_draft_type="grievance",
            sources=[],
            disclaimer="Fallback Demo Mode: This response is generated deterministically for testing without API keys.",
            is_demo=True
        )

    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        return DocumentAnalyzer.analyze(filename, content)

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

    async def check_scheme_eligibility(self, request: SchemeCheckRequest) -> SchemeCheckResponse:
        provided = [f"{k.replace('_', ' ')}: {v}" for k, v in (request.user_criteria or {}).items()]
        missing = ["Age proof", "Income certificate", "State/domicile certificate", "Bank account details"]
        follow_ups = [
            "What is your annual family income?",
            f"Which state do you currently reside in?{'' if request.location else ' (needed for state-specific rules)'}",
            "Do you belong to any special category (SC/ST/OBC/women/farmer/student/senior citizen)?",
        ]
        return SchemeCheckResponse(
            scheme_name=request.scheme_name,
            verdict="needs_info",
            plain_language_summary=(
                f"Offline mode: LawLens cannot verify '{request.scheme_name}' eligibility without live AI access. "
                + (f"You told us: {', '.join(provided)}. " if provided else "No details were provided yet. ")
                + "Provide the missing facts below and retry once AI services are reachable."
            ),
            known_criteria=["Age criteria", "Income ceiling", "Residency / domicile", "Category-specific conditions"],
            criterion_assessment=[],
            missing_information=missing,
            eligible_assessment="Cannot determine yet — more information needed.",
            required_documents=["Aadhaar Card", "Income Certificate", "Address Proof", "Bank Passbook"],
            next_action="Gather the listed documents and check https://myscheme.gov.in for official criteria.",
            follow_up_questions=follow_ups,
            source_url="https://myscheme.gov.in",
            is_demo=True,
        )
