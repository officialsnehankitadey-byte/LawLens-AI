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
    Provides plain-language, conversational guidance with reassurance and 5 real Indian lawyers.
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
            "criminal": "Criminal Defense & Police Matters",
            "cyber_crime": "Cyber Crime & Online Financial Fraud",
            "consumer": "Consumer Rights & Defective Service Complaints",
            "property_tenancy": "Property, Real Estate & Tenant Disputes",
            "family_matrimonial": "Family, Matrimonial & Maintenance Rights",
            "rti": "Right to Information (RTI) & Public Records",
            "employment": "Employment, Salary & Workplace Rights",
            "corporate": "Commercial Contracts & Financial Disputes",
            "civil": "Civil Rights & Public Administration"
        }

        reasonings = {
            "criminal": "Your situation involves police complaints, potential allegations, or immediate bail protection under criminal statutes.",
            "cyber_crime": "Your issue involves unauthorized digital transactions, online cheating, or cyber harassment governed under the IT Act.",
            "consumer": "Your issue is with a seller, company, or service provider failing to deliver promised quality, warranty, or refunds.",
            "property_tenancy": "Your dispute concerns landlord-tenant rules, eviction, security deposit, or real estate possession.",
            "family_matrimonial": "Your situation relates to marital rights, maintenance support, child custody, or domestic protection.",
            "rti": "Your request is to inspect government records, project funds, or tender sanctions under the RTI Act.",
            "employment": "Your grievance concerns workplace dues, wrongful termination, or unpaid compensation from an employer.",
            "corporate": "Your issue relates to business contracts, payments, or commercial agreements.",
            "civil": "Your matter relates to citizen rights and administrative dispute resolution."
        }

        return {
            "category": cat_key,
            "category_name": display_names.get(cat_key, "Civil & Civic Law"),
            "reasoning": reasonings.get(cat_key, "Identified from the key factual events you described.")
        }

    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        """Deterministic fallback analysis with simple human-readable guidance and reassurance."""
        pred = self._predict_category(request.problem, request.category or "auto")
        cat_key = pred["category"]
        loc = request.location or "India"

        if cat_key == "criminal":
            urgency_level = "high_urgency"
            urgency_reason = "Criminal matters and police encounters require quick, careful handling to protect your personal liberty."
            reassurance = "Take a deep breath — you are entitled to full protection under Indian law (Article 22 & BNSS). Police cannot arbitrarily harass or arrest anyone without following mandatory legal safeguards. Follow the steps below calmly."
            immediate_action = "Gather all chat records, timestamps, and witness details calmly. Do not sign any blank papers or give verbal confessions."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Organize Your Evidence & Create a Simple Timeline",
                    simple_summary="Write down exactly what happened with dates, times, and screenshots.",
                    description="Keep a clear record of WhatsApp chats, phone recordings, payment receipts, and witness names on your phone or USB drive.",
                    action_type="gather_documents",
                    why_it_matters="Clear facts will protect you from false claims and help your lawyer secure immediate relief.",
                    practical_tip="Make 3 physical copies of all documents before meeting anyone.",
                    required_documents=["Chronological Timeline", "Chat / Call Screenshots", "Identity Proof (Aadhaar / Voter ID)"]
                ),
                ActionStep(
                    step_number=2,
                    title="Lodge a Written Police Complaint / Obtain Official GD Number",
                    simple_summary="Submit a written signed complaint to the Police Station In-Charge (SHO).",
                    description="Go with a friend or family member. Hand over your written application. If the police refuse to register an FIR, you have the legal right to escalate to the DCP/SP or approach the Magistrate.",
                    action_type="go_to_police",
                    why_it_matters="An official complaint copy with police receiving stamp gives you formal legal protection.",
                    practical_tip="Always ask for the Daily Diary (GD) number or a signed receiving stamp on your photocopy.",
                    authority="Local Police Station / DCP Office / Judicial Magistrate Court",
                    submission_method="In-person Written Complaint with Acknowledgment Copy"
                ),
                ActionStep(
                    step_number=3,
                    title="Consult One of the 5 Verified Criminal Defense Lawyers Below",
                    simple_summary="Speak to a practicing criminal advocate for Anticipatory Bail or FIR quashing.",
                    description="If there is any threat of arrest or false charges, a verified criminal defense advocate will immediately file for Anticipatory Bail in Sessions Court or High Court.",
                    action_type="contact_lawyer",
                    why_it_matters="Anticipatory bail guarantees you cannot be jailed while the case is being investigated.",
                    practical_tip="Reach out to the Senior Advocates recommended in the lawyer list below.",
                    authority="District & Sessions Court / State High Court"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Your Constitutional Rights & Bharatiya Nagarik Suraksha Sanhita (BNSS)",
                    explanation="You have the legal right to know why you are being questioned, the right to free copy of FIR, and the right to consult an advocate of your choice at all times.",
                    relevance_reason="Directly shields citizens from unlawful police detention or harassment.",
                    authority="State Police & Criminal Courts",
                    action_recommended="Always request a written summons/notice before appearing for police questioning.",
                    source_url="https://mha.gov.in"
                )
            ]
            draft_type = "police_complaint"

        elif cat_key == "cyber_crime":
            urgency_level = "high_urgency"
            urgency_reason = "Reporting online financial fraud within the first 24 hours gives police the highest chance to freeze stolen money."
            reassurance = "Don't panic — unauthorized bank transactions are strictly protected under RBI rules. If you report quickly, banks can freeze the scammer's account and you are entitled to full zero-liability reimbursement."
            immediate_action = "Immediately dial 1930 (National Cyber Crime Helpline) and block your bank card/UPI access."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Call Cyber Crime Toll-Free Helpline 1930 Immediately",
                    simple_summary="Dial 1930 right now to freeze the fraud transaction.",
                    description="Tell the operator your bank name, account number, transaction UTR number, and time. The helpline coordinates directly with banks to freeze the destination account.",
                    action_type="call_helpline",
                    why_it_matters="Quick action within the 'golden hour' halts the scammer from withdrawing cash at ATMs.",
                    practical_tip="Keep your transaction SMS or bank notification open while making the call.",
                    required_documents=["Bank Statement with UTR Numbers", "Transaction SMS / Screenshot", "Fake Link / Phishing Details"]
                ),
                ActionStep(
                    step_number=2,
                    title="Register an Official Complaint on cybercrime.gov.in",
                    simple_summary="Fill out the online fraud report on the Government Cyber Portal from your phone.",
                    description="Visit https://cybercrime.gov.in, select 'Report Financial Fraud', and upload transaction screenshots. You will receive an official Cyber Crime Acknowledgment Number.",
                    action_type="online_portal",
                    why_it_matters="Banks and police require this government acknowledgment ID to process money refund claims.",
                    practical_tip="Download the PDF copy of your complaint immediately after submitting.",
                    authority="National Cyber Crime Reporting Portal (Ministry of Home Affairs)",
                    submission_method="Online Portal (cybercrime.gov.in)"
                ),
                ActionStep(
                    step_number=3,
                    title="Submit Zero-Liability Claim to Your Bank Branch Manager",
                    simple_summary="Inform your bank in writing within 3 days for complete refund.",
                    description="Under Reserve Bank of India (RBI) rules, if a customer reports unauthorized electronic fraud within 3 working days, customer liability is ZERO and bank must credit the funds.",
                    action_type="gather_documents",
                    why_it_matters="Enforces RBI's mandatory customer compensation policy.",
                    practical_tip="Submit a written letter to your bank branch with a copy of your cyber complaint and get a signed receiving stamp.",
                    authority="Bank Nodal Officer & RBI Integrated Ombudsman (cms.rbi.org.in)"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="RBI Customer Protection Guidelines & Section 66D IT Act",
                    explanation="Protects citizens against electronic banking theft and cheating by impersonation. Guarantees zero liability when fraud is reported promptly.",
                    relevance_reason="Forces banks to compensate victims of unauthorized digital debits.",
                    authority="Cyber Crime Cell & RBI Ombudsman",
                    action_recommended="File formal claim with Bank Nodal Officer and escalate to RBI Ombudsman if delayed.",
                    source_url="https://cybercrime.gov.in"
                )
            ]
            draft_type = "grievance"

        elif cat_key == "property_tenancy":
            urgency_level = "moderate"
            urgency_reason = "Tenancy issues have standard legal remedies under State Rent Control & RERA."
            reassurance = "No landlord has the legal authority to cut your electricity, water, or lock you out without a formal court eviction order. You are strongly protected under Indian tenancy laws."
            immediate_action = "Keep your original rent agreement, security deposit transfer receipts, and rent payment proofs safe."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Collect Your Rent Agreement & Payment Proofs",
                    simple_summary="Organize your lease agreement, bank transfer proofs, and deposit slips.",
                    description="Ensure you have written records showing on-time rent payment and security deposit submission.",
                    action_type="gather_documents",
                    why_it_matters="Proves lawful possession and prevents false allegations of rent default.",
                    practical_tip="Take photos of your flat condition and utility meters as backup proof.",
                    required_documents=["Registered Agreement / Lease", "Bank Transfer Proofs / UPI Receipts", "Deposit Acknowledgment"]
                ),
                ActionStep(
                    step_number=2,
                    title="Send a Formal Legal Notice via Registered Post",
                    simple_summary="Send a written demand notice giving 15 days to resolve the issue.",
                    description="Draft a formal letter demanding restoration of amenities, deposit refund, or adherence to lease terms. Send via Speed Post.",
                    action_type="send_notice",
                    why_it_matters="A formal notice creates official legal proof if you need to approach the Rent Court or RERA.",
                    practical_tip="Always keep the India Post tracking receipt as proof of delivery.",
                    authority="Concerned Landlord / Tenant / Property Developer"
                ),
                ActionStep(
                    step_number=3,
                    title="Consult One of the 5 Property Advocates Below to Approach Rent Court / RERA",
                    simple_summary="Engage a property advocate to obtain an immediate stay order or file in RERA.",
                    description="If the landlord cuts amenities or withholds deposit, a property lawyer will file an emergency application before the Rent Controller or Civil Court.",
                    action_type="contact_lawyer",
                    why_it_matters="Courts can issue immediate restraining orders preventing unlawful eviction.",
                    practical_tip="Consult one of the top property advocates listed in your location below.",
                    authority="Rent Controller / State RERA Authority"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Transfer of Property Act & State Tenancy Acts",
                    explanation="Prohibits landlords from resorting to self-help eviction or cutting essential services without judicial sanction.",
                    relevance_reason="Protects tenants' right to peaceful possession and refund of security deposit.",
                    authority="Rent Controller & Civil Courts",
                    action_recommended="File police complaint if utilities are cut, and issue formal legal notice for deposit refund.",
                    source_url="https://mohua.gov.in"
                )
            ]
            draft_type = "legal_notice"

        elif cat_key == "family_matrimonial":
            urgency_level = "moderate"
            urgency_reason = "Family matters require sensitive, step-by-step guidance and mediation."
            reassurance = "You are legally entitled to maintenance, residence rights, child visitation, and protection from harassment under Indian Family Laws. These disputes can be resolved calmly and with dignity."
            immediate_action = "Secure original identity records, marriage certificate, bank statements, and children's school documents."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Organize Your Personal & Financial Records",
                    simple_summary="Gather marriage certificates, bank statements, and income proofs.",
                    description="Compile essential documents to establish your financial standing and marital history.",
                    action_type="gather_documents",
                    why_it_matters="Supreme Court requires full income & asset declarations for maintenance and child support.",
                    practical_tip="Keep scanned digital copies in a private, password-protected email or drive.",
                    required_documents=["Marriage Certificate", "Bank Statements / Salary Slips", "Identity Proofs"]
                ),
                ActionStep(
                    step_number=2,
                    title="Opt for Free Pre-Litigation Mediation via Legal Services Authority (DLSA)",
                    simple_summary="Approach District Legal Services Authority for free conciliation.",
                    description="DLSA provides trained mediators to help both parties arrive at a mutual, peaceful settlement regarding maintenance and custody without costly litigation.",
                    action_type="online_portal",
                    why_it_matters="Mediation saves years of court battles and allows peaceful resolution.",
                    practical_tip="Mediation sessions are completely confidential and free of court fees.",
                    authority="District Legal Services Authority (DLSA) / Family Court Mediation Cell"
                ),
                ActionStep(
                    step_number=3,
                    title="Consult One of the 5 Family Law Advocates Listed Below",
                    simple_summary="Get legal representation for formal Family Court petitions.",
                    description="If mediation does not resolve the dispute, consult a verified family advocate to file for maintenance, custody, or mutual consent divorce.",
                    action_type="contact_lawyer",
                    why_it_matters="Ensures court orders for monthly financial maintenance and child custody rights.",
                    practical_tip="Choose from the verified matrimonial advocates suggested below.",
                    authority="Principal Judge, Family Court"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Hindu Marriage Act / Special Marriage Act & Domestic Violence Act",
                    explanation="Provides statutory entitlement to maintenance (food, shelter, medical), residence orders, and child guardianship.",
                    relevance_reason="Ensures financial independence and legal security for spouses and children.",
                    authority="Family Courts & High Court",
                    action_recommended="File application for interim maintenance to secure immediate monthly financial support.",
                    source_url="https://legislative.gov.in"
                )
            ]
            draft_type = "grievance"

        elif cat_key == "rti":
            urgency_level = "standard"
            urgency_reason = "RTI applications have a mandatory statutory timeline of 30 days."
            reassurance = "Every Indian citizen has the fundamental right to inspect government records, tenders, and fund spending under the RTI Act 2005. Public officers are legally required to reply within 30 days."
            immediate_action = "Identify the exact department (e.g. Municipal Corporation, PWD, Transport) holding the records."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Draft 3 to 5 Specific, Clear Questions",
                    simple_summary="Write down concise questions asking for existing government records.",
                    description="Ask for certified copies of sanction orders, tender allocations, progress reports, or inspection notes.",
                    action_type="gather_documents",
                    why_it_matters="Specific questions leave no room for government officers to delay or reject your request.",
                    practical_tip="Ask for copies of official records rather than asking 'why' or seeking opinions.",
                    required_documents=["RTI Application Draft", "Identity Proof", "₹10 Application Fee (IPO / Online)"]
                ),
                ActionStep(
                    step_number=2,
                    title="Submit Application on rtionline.gov.in or via Speed Post with ₹10 Fee",
                    simple_summary="File on the central/state portal or post to the Public Information Officer (PIO).",
                    description="Submit online or mail your signed application with a ₹10 Postal Order to the Public Information Officer (PIO) of the department.",
                    action_type="online_portal",
                    why_it_matters="Starts the 30-day legal clock for the government to hand over records.",
                    practical_tip="If sending by post, use Speed Post and note down the tracking number.",
                    authority="Public Information Officer (PIO)",
                    submission_method="RTI Online Portal (rtionline.gov.in) / Speed Post"
                ),
                ActionStep(
                    step_number=3,
                    title="File First Appeal if No Response Within 30 Days",
                    simple_summary="Escalate to the senior First Appellate Authority if the PIO delays.",
                    description="If the PIO does not reply in 30 days, file a First Appeal. The senior officer can penalize the PIO and order free copies.",
                    action_type="send_notice",
                    why_it_matters="Mandatory escalation before approaching the Information Commission (CIC/SIC).",
                    practical_tip="First Appeal is completely free of cost.",
                    authority="First Appellate Authority (FAA)"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Right to Information (RTI) Act, 2005",
                    explanation="Gives every Indian citizen the statutory power to demand public accountability and inspect government records.",
                    relevance_reason="Empowers citizens to uncover facts regarding public spending and delays.",
                    authority="Central Information Commission (CIC) & State Information Commissions",
                    action_recommended="Submit RTI application online or via registered speed post.",
                    source_url="https://rtionline.gov.in"
                )
            ]
            draft_type = "rti"

        else: # consumer default
            urgency_level = "standard"
            urgency_reason = "Consumer grievances can be resolved through pre-litigation helplines or Consumer Commission."
            reassurance = "Under the Consumer Protection Act 2019, companies are legally accountable for defective items, false promises, or refused refunds. You are entitled to full refund, replacement, and compensation."
            immediate_action = "Save your purchase invoice, unboxing videos, photos of defect, and seller rejection emails."
            steps = [
                ActionStep(
                    step_number=1,
                    title="Gather Proof of Purchase & Defect Photos",
                    simple_summary="Keep your order invoice, unboxing photo/video, and chat history together.",
                    description="Organize your invoice PDF, delivery receipt, and screenshots of seller refusal.",
                    action_type="gather_documents",
                    why_it_matters="Clear purchase and defect evidence makes winning consumer claims fast and straightforward.",
                    practical_tip="Combine all screenshots and invoice into a single easy-to-share PDF.",
                    required_documents=["Order Tax Invoice", "Photos / Videos of Defect", "Customer Care Chat Log"]
                ),
                ActionStep(
                    step_number=2,
                    title="Register a Free Complaint on National Consumer Helpline (Call 1915)",
                    simple_summary="Call 1915 or register on consumerhelpline.gov.in for quick company resolution.",
                    description="NCH is a government service connecting directly with 1000+ top companies (Amazon, Flipkart, Samsung, airlines, etc.). Over 80% grievances are resolved without going to court.",
                    action_type="call_helpline",
                    why_it_matters="Free, quick pre-litigation resolution backed by the Department of Consumer Affairs.",
                    practical_tip="You can also register your complaint via WhatsApp on 8800001915.",
                    authority="National Consumer Helpline (NCH), Dept of Consumer Affairs",
                    submission_method="Online Portal (consumerhelpline.gov.in) / Call 1915 / WhatsApp 8800001915"
                ),
                ActionStep(
                    step_number=3,
                    title="File an Online Claim on e-Daakhil or Consult a Consumer Lawyer",
                    simple_summary="If the company refuses, file an e-complaint in Consumer Court.",
                    description="File on e-daakhil.nic.in with the Consumer Commission. You can seek full product refund plus compensation for mental harassment.",
                    action_type="contact_lawyer",
                    why_it_matters="Consumer Commissions have judicial power to order refunds and heavy financial penalties on sellers.",
                    practical_tip="Consult one of the 5 consumer advocates suggested in your area below.",
                    authority="Consumer Disputes Redressal Commission (District / State)",
                    submission_method="e-Daakhil Portal (e-daakhil.nic.in)"
                )
            ]
            rights = [
                RightOrSchemeItem(
                    topic="Consumer Protection Act, 2019 — Right to Redressal & Refund",
                    explanation="Gives consumers the statutory right to seek replacement, complete refund, and damages for defective products and deficiency in service.",
                    relevance_reason="Directly binds all e-commerce sellers and manufacturers in India.",
                    authority="Consumer Commission & National Consumer Helpline",
                    action_recommended="Lodge complaint on consumerhelpline.gov.in and escalate to e-Daakhil if unresolved.",
                    source_url="https://consumerhelpline.gov.in"
                )
            ]
            draft_type = "consumer_complaint"

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
            reassurance_message=reassurance,
            urgency_level=urgency_level,
            urgency_reason=urgency_reason,
            applicable_rights_or_schemes=rights,
            action_plan=ActionPlan(
                immediate_action=immediate_action,
                reassurance_message=reassurance,
                urgency_level=urgency_level,
                urgency_reason=urgency_reason,
                ordered_steps=steps,
                required_documents=[doc for s in steps for doc in s.required_documents],
                target_authority="Appropriate Statutory Authority / Court of Jurisdiction",
                expected_timeline="15 to 45 days depending on department turnaround",
                warnings=["Maintain copies of all original receipts and notices.", "Do not sign blank papers or verbal agreements."]
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
