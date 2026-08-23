from typing import List, Optional
from pydantic import BaseModel, Field

# --- Health Check ---
class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    ai_provider: str
    api_key_configured: bool

# --- Problem Input & Analysis ---
class ProblemRequest(BaseModel):
    problem: str = Field(..., description="Natural language problem description")
    category: str = Field("consumer", description="Category: consumer, rti, tenant, scheme, notice, service, other")
    location: Optional[str] = Field(None, description="User location (State/District)")
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

# Updated SituationAnalysisResponse with evidence status
class SituationAnalysisResponse(BaseModel):
    id: str
    situation_summary: str
    detected_issue: str
    category: str
    applicable_rights_or_schemes: List[RightOrSchemeItem]
    eligibility_assessment: Optional[str] = None
    action_plan: ActionPlan
    recommended_draft_type: Optional[str] = Field(None, description="rti, consumer_complaint, grievance, appeal")
    sources: List[SourceReference] = []
    disclaimer: str
    is_demo: bool = False
    evidence_status: List[EvidenceItem] = []


# --- Document Analysis ---
class ExtractedFact(BaseModel):
    fact: str
    confidence: Optional[str] = "high"
    category: Optional[str] = "document_fact"

class DocumentAnalysisResponse(BaseModel):
    id: str
    filename: str
    document_type: str
    title: Optional[str] = None
    summary: str
    extracted_facts: List[ExtractedFact]
    explicit_dates: List[str] = []
    explicit_deadlines: List[str] = []
    general_legal_deadlines: List[str] = []
    identified_issues: List[str] = []
    required_documents: List[str] = []
    optional_supporting_evidence: List[str] = []
    recommended_actions: List[str] = []
    immediate_action: Optional[str] = None
    possible_next_steps: List[str] = []
    potentially_applicable_rights: List[RightOrSchemeItem] = []
    verified_sources: List[SourceReference] = []
    recommended_draft_type: Optional[str] = None
    is_demo: bool = False
    provider: str = "fallback"
    mode: str = "fallback"

# --- Scheme Check ---
class SchemeCheckRequest(BaseModel):
    scheme_name: str
    user_criteria: dict

class SchemeCheckResponse(BaseModel):
    scheme_name: str
    known_criteria: List[str]
    missing_information: List[str]
    eligible_assessment: str
    required_documents: List[str]
    next_action: str
    source_url: Optional[str] = None

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
