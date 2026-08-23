from typing import List, Optional
from pydantic import BaseModel, Field

# --- Health Check ---
class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    ai_provider: str
    api_key_configured: bool

# --- Lawyer Directory & Suggestions ---
class SuggestedLawyer(BaseModel):
    id: str
    name: str
    title: str
    specialization: str
    location: str
    court_practice: str
    experience_years: int
    bar_council_reg: Optional[str] = None
    rating: float = 4.8
    reviews_count: int = 100
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    chambers_address: str
    consultation_url: Optional[str] = None
    verified_practitioner: bool = True
    notable_work_or_bio: Optional[str] = None

class LawyerSearchRequest(BaseModel):
    category: Optional[str] = "criminal"
    location: Optional[str] = None
    limit: int = 5

class LawyerSearchResponse(BaseModel):
    category: str
    location_searched: Optional[str] = None
    lawyers: List[SuggestedLawyer] = []

# --- Problem Input & Analysis ---
class ProblemRequest(BaseModel):
    problem: str = Field(..., description="Natural language problem description")
    category: Optional[str] = Field("auto", description="Category: auto, criminal, consumer, cyber_crime, property_tenancy, family_matrimonial, rti, employment, corporate, other")
    location: Optional[str] = Field(None, description="User location (City/State/District)")
    language: str = Field("en", description="Preferred language code (default: en)")

class SourceReference(BaseModel):
    source_name: str
    title: str
    url: Optional[str] = None
    relevance: str
    verification_status: str = Field("verified", description="verified, unverified, or general_knowledge")

class RightOrSchemeItem(BaseModel):
    topic: str
    explanation: str
    relevance_reason: str
    authority: Optional[str] = None
    action_recommended: str
    source_url: Optional[str] = None

class ActionStep(BaseModel):
    step_number: int
    title: str
    description: str
    why_it_matters: str
    required_documents: List[str] = []
    authority: Optional[str] = None
    submission_method: Optional[str] = None

class ActionPlan(BaseModel):
    immediate_action: str
    ordered_steps: List[ActionStep]
    required_documents: List[str]
    target_authority: Optional[str] = None
    expected_timeline: Optional[str] = None
    warnings: List[str] = []

class EvidenceItem(BaseModel):
    item: str
    status: str  # e.g., "Available", "Not provided", "Not established"

# --- Authority Routing (Department Router) ---
class AuthorityRouting(BaseModel):
    authority_name: str
    department: str
    jurisdiction: Optional[str] = None
    submission_method: Optional[str] = None
    portal_url: Optional[str] = None
    notes: Optional[str] = None

# Updated SituationAnalysisResponse with evidence status and lawyer suggestions
class SituationAnalysisResponse(BaseModel):
    id: str
    situation_summary: str
    detected_issue: str
    category: str
    predicted_category: Optional[str] = None
    predicted_category_name: Optional[str] = None
    category_confidence: Optional[str] = "high"
    category_reasoning: Optional[str] = None
    applicable_rights_or_schemes: List[RightOrSchemeItem]
    eligibility_assessment: Optional[str] = None
    action_plan: ActionPlan
    recommended_draft_type: Optional[str] = Field(None, description="rti, consumer_complaint, grievance, appeal, police_complaint, legal_notice")
    sources: List[SourceReference] = []
    disclaimer: str
    is_demo: bool = False
    evidence_status: List[EvidenceItem] = []
    authority_routing: Optional[AuthorityRouting] = None
    suggested_lawyers: List[SuggestedLawyer] = []


# --- Document Analysis ---
class ExtractedFact(BaseModel):
    fact: str
    confidence: Optional[str] = "high"

class DocumentAnalysisResponse(BaseModel):
    id: str
    filename: str
    document_type: str
    summary: str
    extracted_facts: List[ExtractedFact]
    explicit_dates: List[str] = []
    explicit_deadlines: List[str] = []
    identified_issues: List[str] = []
    required_documents: List[str] = []
    recommended_actions: List[str] = []
    recommended_draft_type: Optional[str] = None
    is_demo: bool = False
    authority_routing: Optional[AuthorityRouting] = None
    suggested_lawyers: List[SuggestedLawyer] = []

# --- Scheme Check ---
class SchemeCheckRequest(BaseModel):
    scheme_name: str
    user_criteria: dict = Field(default_factory=dict, description="User-provided facts e.g. age, income, state, occupation")
    location: Optional[str] = Field(None, description="User State/District for state-specific rules")
    language: str = Field("en", description="Preferred language code")

class CriterionAssessment(BaseModel):
    criterion: str
    requirement: str
    your_status: str = Field("Not provided", description="What the user told us")
    met: str = Field("unknown", description="yes, no, or unknown")

class SchemeCheckResponse(BaseModel):
    scheme_name: str
    verdict: str = Field("needs_info", description="eligible, likely_eligible, likely_ineligible, needs_info")
    plain_language_summary: Optional[str] = None
    known_criteria: List[str]
    criterion_assessment: List[CriterionAssessment] = []
    missing_information: List[str]
    eligible_assessment: str = Field(description="Human-readable verdict sentence (back-compat)")
    required_documents: List[str]
    next_action: str
    follow_up_questions: List[str] = []
    source_url: Optional[str] = None
    is_demo: bool = False

# --- Conversational Form-Filler (Interview) ---
class InterviewQuestion(BaseModel):
    field_key: str
    question: str
    answer_type: str = Field("text", description="text, textarea, select, date, number, email, tel")
    options: List[str] = []
    required: bool = False
    help_text: Optional[str] = None

class InterviewStartRequest(BaseModel):
    draft_type: str = Field(..., description="rti, consumer_complaint, grievance, appeal")
    case_summary: str = Field(..., description="Plain-language description of the issue")

class InterviewStartResponse(BaseModel):
    interview_id: str
    draft_type: str
    title: str
    questions: List[InterviewQuestion]

class InterviewSubmitRequest(BaseModel):
    interview_id: Optional[str] = None
    draft_type: str
    case_summary: str
    answers: dict = Field(default_factory=dict, description="field_key -> user answer")
    target_authority: Optional[str] = None
    specific_demands: Optional[List[str]] = None

# --- Draft Generation ---
class DraftRequest(BaseModel):
    draft_type: str = Field(..., description="rti, consumer_complaint, grievance, appeal")
    case_summary: str
    user_details: dict = Field(default_factory=dict)
    target_authority: Optional[str] = None
    specific_demands: Optional[List[str]] = None

class DraftResponse(BaseModel):
    draft_id: str
    draft_type: str
    title: str
    content: str
    placeholders_used: List[str] = []
    editable: bool = True
    disclaimer: str
