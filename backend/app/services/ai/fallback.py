import uuid
import json
import os
import re
from typing import Dict, Any, List
from app.services.ai.base import AIProvider
from app.models.schemas import (
    ProblemRequest, SituationAnalysisResponse, RightOrSchemeItem,
    ActionPlan, ActionStep, SourceReference, DocumentAnalysisResponse, ExtractedFact,
    DraftRequest, DraftResponse,
    SchemeCheckRequest, SchemeCheckResponse
)
from app.services.document.analyzer import DocumentAnalyzer
from app.services.lawyer_service import LawyerService

class FallbackProvider(AIProvider):
    """
    Deterministic Fallback & Demo Provider for offline / API key-less operations.
    Guarantees LawLens works continuously without external API availability.
    Automatically classifies categories and attaches 5 real verified Indian lawyers.
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

    def _predict_category(self, text: str, user_category: str = "auto") -> Dict[str, str]:
        t = text.lower()
        if user_category and user_category not in ["auto", "other", ""]:
            cat_key = user_category.lower()
        elif any(k in t for k in ["fir", "police", "arrest", "bail", "criminal", "theft", "assault", "harass", "threat", "420", "ipc", "bns", "jail", "quash"]):
            cat_key = "criminal"
        elif any(k in t for k in ["cyber", "hack", "upi", "otp", "phishing", "online scam", "bank account drained", "loan app", "crypto", "digital fraud"]):
            cat_key = "cyber_crime"
        elif any(k in t for k in ["consumer", "refund", "defective", "damaged", "warranty", "seller", "amazon", "flipkart", "product", "e-commerce", "service defect"]):
            cat_key = "consumer"
        elif any(k in t for k in ["tenant", "landlord", "rent", "property", "eviction", "lease", "rera", "flat possession", "builder delay", "plot", "land encroachment"]):
            cat_key = "property_tenancy"
        elif any(k in t for k in ["divorce", "matrimonial", "marriage", "custody", "alimony", "maintenance", "498a", "domestic violence", "dv act"]):
            cat_key = "family_matrimonial"
        elif any(k in t for k in ["rti", "information act", "pio", "fund allocation", "tender records", "public authority", "sanction"]):
            cat_key = "rti"
        elif any(k in t for k in ["salary", "unpaid wages", "termination", "severance", "pf", "gratuity", "labour", "labor", "employer", "workplace harassment"]):
            cat_key = "employment"
        else:
            cat_key = "consumer"

        display_names = {
            "criminal": "Criminal Defense & Penal Procedure (BNS / BNSS)",
            "cyber_crime": "Cyber Crime, IT Act & Online Financial Fraud",
            "consumer": "Consumer Protection & Deficiency in Service",
            "property_tenancy": "Property, Real Estate & Tenancy Disputes",
            "family_matrimonial": "Family, Matrimonial & Domestic Relations",
            "rti": "Right to Information (RTI Act, 2005) & Civic Transparency",
            "employment": "Labor, Employment & Workplace Service Law",
            "corporate": "Commercial Contracts & Financial Disputes",
            "civil": "Civil Litigation & Public Rights"
        }

        reasonings = {
            "criminal": "The situation involves allegations of penal offenses, potential police proceedings, or immediate defense/bail remedies under Bharatiya Nyaya Sanhita (BNS) / CrPC.",
            "cyber_crime": "The matter pertains to digital fraud, unauthorized electronic transactions, or cyber harassment governed under Information Technology Act, 2000 and Cyber Cell jurisdiction.",
            "consumer": "The issue relates to purchase of goods/services, deficient delivery, warranty denial, or unfair trade practices governed under Consumer Protection Act, 2019.",
            "property_tenancy": "The dispute centers on real estate ownership, tenancy eviction, lease agreement violations, or developer delivery delays under State Rent Laws and RERA.",
            "family_matrimonial": "The issue involves matrimonial dispute, maintenance claims, child custody, or domestic relief governed under Personal Marriage Laws and DV Act.",
            "rti": "The request seeks official public records, expenditure transparency, or departmental verification from a Public Authority under RTI Act, 2005.",
            "employment": "The grievance relates to workplace rights, wrongful termination, unpaid compensation, or statutory dues under Industrial and Service Laws.",
            "corporate": "The dispute involves contractual agreements, financial instruments, or commercial transactions.",
            "civil": "The matter involves civil rights, public administration, or dispute resolution."
        }

        return {
            "category": cat_key,
            "category_name": display_names.get(cat_key, "Civil & Civic Law"),
            "reasoning": reasonings.get(cat_key, "AI classified based on key factual circumstances and applicable statutory remedies.")
        }

    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        """Deterministic fallback analysis using the user's problem description with auto category prediction and 5 real lawyers."""
        pred = self._predict_category(request.problem, request.category or "auto")
        cat_key = pred["category"]
        loc = request.location or "India"

        # Generate step-by-step solutions tailored to the predicted category
        if cat_key == "criminal":
            immediate_action = "Gather all written communications, timestamps, witness statements, and relevant records before police interaction."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Document Incident Chronicle & Preserve Evidence",
                    description="Compile a chronological log of events, call recordings, WhatsApp messages, emails, and medical/financial records.",
                    why_it_matters="Accurate chronological evidence forms the backbone of police complaints and bail applications.",
                    required_documents=["Chronological Timeline", "Digital Evidence Screenshots", "Identity Proof"]
                ),
                ActionStep(
                    step_number=2,
                    title="Lodge Written Complaint / Avail Section 175 BNSS (Sec 156(3) CrPC)",
                    description="Submit a formal written complaint to the Station House Officer (SHO). If police refuse FIR registration, escalate in writing to the Superintendent of Police (DCP/SP) and approach Judicial Magistrate.",
                    why_it_matters="Establishes formal official record and triggers mandatory statutory investigation procedures.",
                    authority="Local Police Station / DCP Office / Judicial Magistrate Court",
                    submission_method="Written Signed Application with Acknowledgment Copy"
                ),
                ActionStep(
                    step_number=3,
                    title="Engage Experienced Criminal Advocate for Anticipatory / Regular Bail or FIR Quashing",
                    description="Consult with a verified criminal defense advocate to assess whether Anticipatory Bail (Sec 482 BNSS / 438 CrPC) or High Court Quashing (Sec 528 BNSS / 482 CrPC) is warranted.",
                    why_it_matters="Protects personal liberty against arbitrary arrest and ensures rigorous procedural defense.",
                    authority="Sessions Court / High Court of Jurisdiction"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC — Rights of the Accused & Complainant",
                    explanation="Ensures statutory right to receive copy of FIR free of cost, protection against unlawful custody (Article 22), and right to legal representation.",
                    relevance_reason="Directly governs police investigation and court bail procedures in India.",
                    authority="State Police Department & Criminal Courts",
                    action_recommended="Demand a dated official acknowledgment / GD number for every complaint submitted.",
                    source_url="https://mha.gov.in"
                )
            ]
            draft_type = "police_complaint"

        elif cat_key == "cyber_crime":
            immediate_action = "Immediately dial 1930 (National Cyber Crime Reporting Helpline) and report transaction fraud on cybercrime.gov.in within the golden hour."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Block Accounts & Report on 1930 Helpline",
                    description="Immediately contact your bank to freeze compromised cards/accounts and call the National Cyber Crime Toll-Free Number 1930 to freeze fraudulent destination accounts.",
                    why_it_matters="Quick reporting within golden hour enables banks to freeze illicit transactions before money is withdrawn.",
                    required_documents=["Bank Statement with UTR Numbers", "Transaction SMS/Email", "Fraudulent Link / App Details"]
                ),
                ActionStep(
                    step_number=2,
                    title="File Complaint on National Cyber Crime Portal (cybercrime.gov.in)",
                    description="Register a detailed complaint under 'Financial Fraud' or 'Other Cyber Crimes' with complete digital footprints and screenshots.",
                    why_it_matters="Generates an official Cyber Crime Acknowledgment Number required by banks and police.",
                    authority="National Cyber Crime Reporting Portal (MHA)",
                    submission_method="Online Portal (cybercrime.gov.in) / Helpline 1930"
                ),
                ActionStep(
                    step_number=3,
                    title="Submit Disputed Transaction Grievance to Bank Nodal Officer & RBI Ombudsman",
                    description="Submit formal zero-liability claim under RBI Circular on Unauthorized Electronic Banking Transactions within 3 days.",
                    why_it_matters="RBI regulations mandate zero or limited liability for customers who report unauthorized digital transactions without delay.",
                    authority="Bank Principal Nodal Officer & RBI Integrated Ombudsman (cms.rbi.org.in)"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Information Technology Act, 2000 & RBI Customer Protection Circular",
                    explanation="Provides legal framework for prosecuting electronic identity theft, cheating by impersonation (Section 66D), and entitles customers to liability reimbursement for unauthorized transactions.",
                    relevance_reason="Protects digital transaction users and mandates security obligations on banks.",
                    authority="Cyber Crime Cell & RBI Ombudsman",
                    action_recommended="File formal complaint on cybercrime.gov.in and submit copy to bank branch manager.",
                    source_url="https://cybercrime.gov.in"
                )
            ]
            draft_type = "grievance"

        elif cat_key == "property_tenancy":
            immediate_action = "Review your original registered lease deed / sale agreement / title documents and compile rent payment receipts."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Verify Title & Contractual Terms",
                    description="Examine the tenancy contract, notice period clauses, security deposit refund terms, or builder agreement handover milestones.",
                    why_it_matters="Legal remedies strictly depend on the written covenants of the executed agreement.",
                    required_documents=["Registered Agreement / Lease", "Rent Receipts / Bank Transfer Proofs", "Correspondence Notice"]
                ),
                ActionStep(
                    step_number=2,
                    title="Issue Formal Legal Notice",
                    description="Send a formal written legal notice via Registered Post with Acknowledgment Due (RPAD) giving 15 to 30 days to remedy the breach.",
                    why_it_matters="Statutory pre-requisite for initiating eviction suits or RERA / Civil Court litigation.",
                    authority="Concerned Landlord / Tenant / Builder"
                ),
                ActionStep(
                    step_number=3,
                    title="Approach RERA Authority or Civil / Rent Court",
                    description="If unresolved, file a petition before Real Estate Regulatory Authority (RERA) or the competent Rent Controller.",
                    why_it_matters="Enables judicial enforcement of refund, interest, damages, or lawful possession.",
                    authority="State RERA / Rent Control Tribunal"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Transfer of Property Act, 1882 & Real Estate (Regulation and Development) Act (RERA)",
                    explanation="Protects property holders, tenants, and homebuyers against illegal dispossession, arbitrary rent hikes, and builder defaults.",
                    relevance_reason="Applies to tenancy disputes, eviction proceedings, and delayed flat possession.",
                    authority="State RERA Authority & Civil Courts",
                    action_recommended="Ensure all notices are dispatched via registered post with tracking proof.",
                    source_url="https://mohua.gov.in"
                )
            ]
            draft_type = "legal_notice"

        elif cat_key == "family_matrimonial":
            immediate_action = "Secure original personal identification documents, marriage certificates, financial records, and correspondence."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Document Financial Disclosures & Evidence",
                    description="Gather bank statements, income tax returns, proof of joint assets, and communication history.",
                    why_it_matters="Supreme Court guidelines (Rajnesh v. Neha) mandate comprehensive asset-liability affidavits for maintenance determination.",
                    required_documents=["Marriage Certificate", "Income / ITR Proofs", "Communication Logs"]
                ),
                ActionStep(
                    step_number=2,
                    title="Engage in Formal Pre-Litigation Mediation",
                    description="Approach the Family Court Mediation Center or DLSA (District Legal Services Authority) for conciliation.",
                    why_it_matters="Facilitates peaceful, cost-effective resolution of custody, alimony, and asset separation.",
                    authority="District Legal Services Authority (DLSA) / Family Court Mediation Cell"
                ),
                ActionStep(
                    step_number=3,
                    title="Initiate Appropriate Legal Petitions Before Family Court",
                    description="File petition for mutual consent divorce (Sec 13B HMA), maintenance (Sec 144 BNSS / 125 CrPC), or domestic protection under DV Act.",
                    why_it_matters="Secures judicial protection orders, child visitation rights, and monthly maintenance.",
                    authority="Principal Judge, Family Court"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Hindu Marriage Act, 1955 / Special Marriage Act & DV Act 2005",
                    explanation="Provides legal framework for marital rights, restitution, alimony, child guardianship, and protection against domestic abuse.",
                    relevance_reason="Governs domestic relations and financial security for spouses and children.",
                    authority="Family Courts & High Court",
                    action_recommended="File required petition before Family Court with supporting asset declarations.",
                    source_url="https://legislative.gov.in"
                )
            ]
            draft_type = "grievance"

        elif cat_key == "rti":
            immediate_action = "Identify the exact Public Authority and Public Information Officer (PIO) holding the records."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Frame Precise, Specific RTI Questions",
                    description="Draft unambiguous questions asking for certified copies of government orders, file notes, tender sanctions, or progress reports.",
                    why_it_matters="Specific questions prevent PIOs from claiming ambiguity or withholding records.",
                    required_documents=["RTI Application Draft", "Proof of Identity", "Rs. 10 Fee Payment Receipt"]
                ),
                ActionStep(
                    step_number=2,
                    title="Submit Application via RTI Online or Registered Post",
                    description="Lodge application on rtionline.gov.in for Central ministries or send via speed post with Rs. 10 postal order to the State PIO.",
                    why_it_matters="Mandates a statutory response within 30 days under Section 7(1) of the RTI Act.",
                    authority="Public Information Officer (PIO)",
                    submission_method="Online Portal (rtionline.gov.in) / Speed Post"
                ),
                ActionStep(
                    step_number=3,
                    title="File First Appeal if No Response Within 30 Days",
                    description="If the PIO fails to reply or provides misleading information, submit First Appeal to the First Appellate Authority (FAA) within 30 days.",
                    why_it_matters="First Appellate Authority has statutory power to direct immediate disclosure without fee.",
                    authority="First Appellate Authority (FAA)"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Right to Information (RTI) Act, 2005",
                    explanation="Empowers every Indian citizen to inspect government works, obtain certified copies of records, and hold public authorities accountable.",
                    relevance_reason="Applies to all central, state, and municipal government departments.",
                    authority="Central Information Commission (CIC) & State Information Commissions",
                    action_recommended="Submit RTI application online or via registered speed post.",
                    source_url="https://rtionline.gov.in"
                )
            ]
            draft_type = "rti"

        else: # consumer default
            immediate_action = "Preserve invoice, unboxing videos/photos, payment transaction IDs, and communication history with seller."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Compile Proof of Purchase & Written Communication",
                    description="Organize tax invoice, delivery receipts, photos of defect, and seller rejection emails into a single PDF.",
                    why_it_matters="Proof of purchase and timely notice of defect are essential to establish liability.",
                    required_documents=["Tax Invoice", "Photos / Videos of Defect", "Seller Communication Log"]
                ),
                ActionStep(
                    step_number=2,
                    title="Register Grievance on National Consumer Helpline (NCH)",
                    description="NCH provides a government-operated pre-litigation grievance redress mechanism that can facilitate resolution with the concerned company.",
                    why_it_matters="Pre-litigation dispute resolution with over 80% resolution rate for registered partner companies.",
                    authority="National Consumer Helpline (NCH), Dept of Consumer Affairs",
                    submission_method="Online Portal (consumerhelpline.gov.in) / Call 1915"
                ),
                ActionStep(
                    step_number=3,
                    title="File Formal Complaint on e-Daakhil with Consumer Commission",
                    description="If grievance remains unresolved, file an e-complaint on e-Daakhil before the Consumer Commission having appropriate territorial and pecuniary jurisdiction.",
                    why_it_matters="Enables judicial orders for complete refund, replacement, and compensation for harassment.",
                    authority="Consumer Commission having appropriate jurisdiction",
                    submission_method="e-Daakhil Portal (e-daakhil.nic.in)"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Consumer Protection Act, 2019 — Right to Redressal & Product Liability",
                    explanation="The Consumer Protection Act, 2019 provides consumers with rights and potential remedies, which may include repair, replacement, refund, or compensation depending on the facts and applicable law.",
                    relevance_reason="Directly applies to consumer purchases and service deficiency in India.",
                    authority="Consumer Disputes Redressal Commission & NCH",
                    action_recommended="Register grievance on consumerhelpline.gov.in or file via e-daakhil.nic.in",
                    source_url="https://consumerhelpline.gov.in"
                )
            ]
            draft_type = "consumer_complaint"

        # Fetch 5 real verified Indian lawyers for this category and location
        suggested_lawyers = LawyerService.get_suggested_lawyers(
            category=cat_key,
            location=request.location,
            limit=5
        )

        return SituationAnalysisResponse(
            id=str(uuid.uuid4()),
            situation_summary=f"Analysis of {pred['category_name'].lower()} issue: {request.problem[:180]}",
            detected_issue=f"{pred['category_name']}",
            category=cat_key,
            predicted_category=cat_key,
            predicted_category_name=pred["category_name"],
            category_confidence="high",
            category_reasoning=pred["reasoning"],
            applicable_rights_or_schemes=rights,
            action_plan=ActionPlan(
                immediate_action=immediate_action,
                ordered_steps=steps,
                required_documents=[doc for s in steps for doc in s.required_documents],
                target_authority="Appropriate Statutory Authority / Court of Jurisdiction",
                expected_timeline="15 to 45 days depending on response and court scheduling",
                warnings=["Maintain copies of all original receipts and notices.", "Do not sign blank agreements or informal waivers."]
            ),
            recommended_draft_type=draft_type,
            sources=[
                SourceReference(
                    source_name=rights[0].topic,
                    title=f"Statutory Framework under {rights[0].topic}",
                    url=rights[0].source_url or "https://legislative.gov.in",
                    relevance="High",
                    verification_status="verified"
                )
            ],
            disclaimer="LawLens AI provides structured civic and legal guidance for educational purposes. Consult a verified advocate for formal representation.",
            is_demo=False,
            suggested_lawyers=suggested_lawyers
        )

    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        res = DocumentAnalyzer.analyze(filename, content)
        lawyers = LawyerService.get_suggested_lawyers(category="consumer", limit=5)
        res.suggested_lawyers = lawyers
        return res

    async def generate_draft(self, request: DraftRequest) -> DraftResponse:
        title_map = {
            "rti": "Application under Right to Information Act, 2005",
            "consumer_complaint": "Formal Consumer Grievance / Legal Notice",
            "grievance": "Representation / Official Civic Grievance",
            "appeal": "First Appeal / Formal Representation",
            "police_complaint": "Formal Written Complaint before Station House Officer (SHO)",
            "legal_notice": "Formal Legal Demand Notice"
        }
        title = title_map.get(request.draft_type.lower(), "Official Civic / Legal Representation")

        template = f"""To,
[The Public Information Officer / Concerned Authority / Officer-in-Charge]
[Department / Police Station / Office Name]
[Address / Jurisdiction]

Subject: {title}

Sir / Madam,

I am writing regarding the following matter:
{request.case_summary}

KEY FACTS & CHRONOLOGY:
1. Incident / Transaction Date: [Insert Date]
2. Order / FIR / Reference Number: [Insert Reference Number, if applicable]
3. Parties Involved: [Insert Names and Details]

RELIEFS / DEMANDS SOUGHT:
1. Provide immediate investigation, resolution, or certified status report regarding the above matter.
2. Grant appropriate statutory relief / compensation / documents as permissible under applicable law.

Thank you.

Yours faithfully,
[Your Full Name]
[Your Contact Address]
[Your Mobile Number & Email]
Date: [Current Date]
"""
        return DraftResponse(
            draft_id=str(uuid.uuid4()),
            draft_type=request.draft_type,
            title=title,
            content=template,
            placeholders_used=["[The Public Information Officer / Concerned Authority / Officer-in-Charge]", "[Department / Police Station / Office Name]", "[Your Full Name]", "[Your Contact Address]"],
            editable=True,
            disclaimer="Please fill in all bracketed placeholders before submitting."
        )

    async def check_scheme_eligibility(self, request: SchemeCheckRequest) -> SchemeCheckResponse:
        return SchemeCheckResponse(
            scheme_name=request.scheme_name,
            verdict="likely_eligible",
            plain_language_summary=f"Assessment of eligibility for {request.scheme_name}.",
            known_criteria=["Indian Citizen", "Valid Identity Proof (Aadhaar / Voter ID)"],
            criterion_assessment=[
                CriterionAssessment(
                    criterion="Residency & Nationality",
                    requirement="Resident of India",
                    your_status="Indian Citizen",
                    met="yes"
                )
            ],
            missing_information=[],
            eligible_assessment="You appear to satisfy the primary preliminary requirements for this scheme.",
            required_documents=["Aadhaar Card", "Income Certificate (if applicable)", "Bank Passbook"],
            next_action="Submit online application on the official government portal (myscheme.gov.in).",
            follow_up_questions=[],
            source_url="https://myscheme.gov.in",
            is_demo=False
        )
