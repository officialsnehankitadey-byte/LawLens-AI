import uuid
import json
import os
from app.services.ai.base import AIProvider
from app.models.schemas import (
    ProblemRequest, SituationAnalysisResponse, RightOrSchemeItem,
    ActionPlan, ActionStep, SourceReference, DocumentAnalysisResponse, ExtractedFact,
    DraftRequest, DraftResponse
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
        """Category and keyword-aware fallback legal analysis for offline/API key-less operation."""
        problem_text = (request.problem or "").lower()
        cat = (request.category or "").lower()

        # Default fallback tokens
        detected_issue = "Civic & Consumer Rights Inquiry"
        summary = f"Analysis of reported situation: {request.problem[:220]}"
        rec_draft = "consumer_complaint"
        rights = []
        ordered_steps = []
        req_docs = []
        target_auth = "Concerned Authority / Legal Commission"
        timeline = "30 - 60 Days"
        sources = []

        if "accident" in problem_text or "car" in problem_text or "vehicle" in problem_text or "insurance" in problem_text:
            detected_issue = "Motor Vehicle Accident & Third-Party Liability Relief"
            summary = "Grievance involving motor vehicle collision, lack of insurance coverage, and potential third-party compensation or repair dispute."
            rec_draft = "consumer_complaint"
            target_auth = "Motor Accident Claims Tribunal (MACT) / Consumer Disputes Redressal Commission"
            timeline = "30 - 90 Days"
            rights = [
                RightOrSchemeItem(
                    topic="Motor Vehicles Act, 1988 — Section 166 (Compensation Claims)",
                    explanation="Provides statutory entitlement for victims of motor vehicle accidents to claim compensation for property damage or bodily injuries from negligent counterparties.",
                    relevance_reason="Applies directly to motor vehicle accidents involving uninsured drivers or disputed liability.",
                    authority="Motor Accident Claims Tribunal (MACT)",
                    action_recommended="File a formal claim petition before MACT within the appropriate territorial jurisdiction.",
                    source_url="https://morth.nic.in"
                ),
                RightOrSchemeItem(
                    topic="Consumer Protection Act, 2019 — Deficient Service & Fair Trade Rights",
                    explanation="Protects consumers against unfair trade practices and deficiency in insurance or repair workshop services.",
                    relevance_reason="Applies if an authorized service center, insurer, or third-party vendor misrepresents liability or delays repair estimates.",
                    authority="Consumer Disputes Redressal Commission",
                    action_recommended="Submit a formal notice or pre-litigation grievance on the National Consumer Helpline.",
                    source_url="https://consumerhelpline.gov.in"
                )
            ]
            ordered_steps = [
                ActionStep(
                    step_number=1,
                    title="File Police Intimation / Spot Report",
                    description="Report the accident details immediately at the police station having jurisdiction over the crash site and secure a General Diary (GD) or First Information Report (FIR) copy.",
                    why_it_matters="Police records serve as foundational primary evidence for insurance, MACT claims, and establishing collision facts."
                ),
                ActionStep(
                    step_number=2,
                    title="Gather Evidence & Itemized Repair Estimates",
                    description="Obtain clear high-resolution photos of vehicle damage, spot location, towing receipts, and a certified itemized estimate from an authorized garage.",
                    why_it_matters="Verifiable repair estimates and visual evidence prevent counter-parties from disputing the quantum of loss."
                ),
                ActionStep(
                    step_number=3,
                    title="Serve Legal Notice / Pre-Litigation Notice",
                    description="Issue a written notice to the opposing driver/owner outlining the collision facts, itemized loss, and demand for reimbursement within 15 days.",
                    why_it_matters="Establishes good-faith pre-litigation resolution attempts and creates a clear timeline for subsequent tribunal filing."
                ),
                ActionStep(
                    step_number=4,
                    title="File Petition before MACT or Consumer Forum",
                    description="If unresolved after notice expiry, file a petition in the local Motor Accident Claims Tribunal or Consumer Disputes Redressal Commission.",
                    why_it_matters="Ensures formal legal adjudication and legally enforceable recovery of damages."
                )
            ]
            req_docs = [
                "Police FIR / General Diary (GD) Entry Copy",
                "Vehicle Registration Certificate (RC)",
                "Driver Driving License Copy",
                "Itemized Garage Damage Repair Estimate & Receipts",
                "Accident Spot Photos & Video Evidence",
                "Medical Records & Bills (if personal injury occurred)"
            ]
            sources = [
                SourceReference(
                    source_name="Ministry of Road Transport and Highways (MoRTH)",
                    title="Motor Vehicles Act & Traffic Safety Guidelines",
                    url="https://morth.nic.in",
                    relevance="High",
                    verification_status="verified"
                ),
                SourceReference(
                    source_name="National Consumer Helpline (NCH)",
                    title="Pre-Litigation Grievance Redressal Portal",
                    url="https://consumerhelpline.gov.in",
                    relevance="High",
                    verification_status="verified"
                )
            ]

        elif cat == "rti" or "rti" in problem_text or "information" in problem_text or "record" in problem_text:
            detected_issue = "Right to Information (RTI) Seek / Public Record Disclosure"
            summary = "Request for public records, government expenditure details, or official sanction copies under the Right to Information Act."
            rec_draft = "rti"
            target_auth = "Public Information Officer (PIO) / Public Authority"
            timeline = "30 Days mandatory response window"
            rights = [
                RightOrSchemeItem(
                    topic="Right to Information Act, 2005 — Section 6(1) Right to Request",
                    explanation="Empowers every Indian citizen to seek certified information, records, inspection of public works, and copies of official sanctions from public authorities.",
                    relevance_reason="Guarantees legal right to request specific government files, inspection reports, and expenditure details.",
                    authority="Central / State Information Commission",
                    action_recommended="Submit a structured RTI Application to the designated Public Information Officer.",
                    source_url="https://rtionline.gov.in"
                )
            ]
            ordered_steps = [
                ActionStep(
                    step_number=1,
                    title="Identify Public Information Officer (PIO)",
                    description="Determine the appropriate department (e.g., Municipal Corporation, PWD, Revenue Dept) and address of the Public Information Officer.",
                    why_it_matters="Ensures the application reaches the custodian of the requested records without delay."
                ),
                ActionStep(
                    step_number=2,
                    title="Formulate Objective RTI Questions",
                    description="List clear, specific questions requesting certified copies of tenders, work orders, payment receipts, or inspection logs.",
                    why_it_matters="Vague or subjective questions can lead to rejection; specific document requests mandate disclosure."
                ),
                ActionStep(
                    step_number=3,
                    title="Submit Application with Statutory Fee",
                    description="Submit online at rtionline.gov.in or send physically via Registered Post AD along with the statutory Rs. 10 application fee.",
                    why_it_matters="Physical proof of delivery or digital receipt triggers the 30-day legal response clock."
                ),
                ActionStep(
                    step_number=4,
                    title="Monitor 30-Day Response & Prepare First Appeal",
                    description="If PIO fails to respond within 30 days or provides incomplete data, file First Appeal under Section 19(1).",
                    why_it_matters="First Appeal escalates the non-disclosure to senior departmental officers."
                )
            ]
            req_docs = [
                "Drafted RTI Application Form / Letter",
                "Proof of Fee Payment (IPO / Court Fee Stamp / Online Receipt)",
                "Applicant Photo ID & Postal Address Proof",
                "Specific Project Reference / Tender Numbers (if available)"
            ]
            sources = [
                SourceReference(
                    source_name="Central Information Commission (RTI Online)",
                    title="RTI Act Rules & Online Application Portal",
                    url="https://rtionline.gov.in",
                    relevance="High",
                    verification_status="verified"
                )
            ]

        else:
            # General / Consumer / Civic Fallback
            detected_issue = "Consumer Protection & Civic Grievance Relief"
            summary = f"Civic or consumer dispute concerning: {request.problem[:180]}"
            rec_draft = "consumer_complaint" if cat == "consumer" else "grievance"
            target_auth = "National Consumer Helpline / Departmental Grievance Officer"
            timeline = "15 - 45 Days"
            rights = [
                RightOrSchemeItem(
                    topic="Consumer Protection Act, 2019 — Right to Redressal",
                    explanation="Guarantees protection against deficient services, unfair trade practices, and non-performance of statutory obligations.",
                    relevance_reason="Applies to commercial transactions, civic service deficiencies, and contractual disputes.",
                    authority="Consumer Disputes Redressal Commission / CPGRAMS",
                    action_recommended="File formal grievance or pre-litigation complaint.",
                    source_url="https://consumerhelpline.gov.in"
                )
            ]
            ordered_steps = [
                ActionStep(
                    step_number=1,
                    title="Consolidate Transaction Records & Communications",
                    description="Gather all receipts, contracts, emails, notices, and payment proofs relating to your dispute.",
                    why_it_matters="Comprehensive document trails build irrefutable factual support for your claim."
                ),
                ActionStep(
                    step_number=2,
                    title="Issue Pre-Litigation Written Representation",
                    description="Send a formal representation or legal notice detailing your grievance and giving 15 days for resolution.",
                    why_it_matters="Demonstrates good faith effort to resolve the dispute before filing formal proceedings."
                ),
                ActionStep(
                    step_number=3,
                    title="Lodge Online Grievance on Government Portal",
                    description="Register your complaint on NCH (consumerhelpline.gov.in) or CPGRAMS (pgportal.gov.in).",
                    why_it_matters="Leverages government-monitored pre-litigation redressal mechanisms."
                ),
                ActionStep(
                    step_number=4,
                    title="Escalate to District Consumer Commission or Tribunal",
                    description="If unresolved after the statutory window, file your petition before the competent commission.",
                    why_it_matters="Provides binding legal remedy and enforceable financial compensation."
                )
            ]
            req_docs = [
                "Transaction Invoice / Service Receipt / Agreement",
                "Written Communication & Email Logs",
                "Government Identity Proof (Aadhaar / Voter ID)",
                "Bank Statement showing payment proof"
            ]
            sources = [
                SourceReference(
                    source_name="National Consumer Helpline (NCH)",
                    title="Consumer Grievance Redressal Portal",
                    url="https://consumerhelpline.gov.in",
                    relevance="High",
                    verification_status="verified"
                ),
                SourceReference(
                    source_name="CPGRAMS Portal",
                    title="Centralized Public Grievance Redress System",
                    url="https://pgportal.gov.in",
                    relevance="High",
                    verification_status="verified"
                )
            ]

        plan = ActionPlan(
            immediate_action=ordered_steps[0].description if ordered_steps else "Gather all facts and documentation regarding your issue.",
            ordered_steps=ordered_steps,
            required_documents=req_docs,
            target_authority=target_auth,
            expected_timeline=timeline,
            warnings=["Keep copies of all submitted documents and postage receipts."]
        )

        return SituationAnalysisResponse(
            id=str(uuid.uuid4()),
            situation_summary=summary,
            detected_issue=detected_issue,
            category=request.category,
            applicable_rights_or_schemes=rights,
            action_plan=plan,
            recommended_draft_type=rec_draft,
            sources=sources,
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
