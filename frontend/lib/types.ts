export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  ai_provider: string;
  api_key_configured: boolean;
}

export interface SuggestedLawyer {
  id: string;
  name: string;
  title: string;
  specialization: string;
  location: string;
  court_practice: string;
  experience_years: number;
  bar_council_reg?: string;
  rating: number;
  reviews_count: number;
  contact_phone?: string;
  contact_email?: string;
  chambers_address: string;
  consultation_url?: string;
  verified_practitioner: boolean;
  notable_work_or_bio?: string;
}

export interface LawyerSearchResponse {
  category: string;
  location_searched?: string;
  lawyers: SuggestedLawyer[];
}

export interface ProblemRequest {
  problem: string;
  category?: string;
  location?: string;
  language?: string;
}

export interface SourceReference {
  source_name: string;
  title: string;
  url?: string;
  relevance: string;
  verification_status: string;
}

export interface RightOrSchemeItem {
  topic: string;
  explanation: string;
  relevance_reason: string;
  authority?: string;
  action_recommended: string;
  source_url?: string;
}

export interface ActionStep {
  step_number: number;
  title: string;
  simple_summary?: string;
  description: string;
  action_type?: string;
  why_it_matters: string;
  practical_tip?: string;
  required_documents?: string[];
  authority?: string;
  submission_method?: string;
}

export interface ActionPlan {
  immediate_action: string;
  reassurance_message?: string;
  urgency_level?: string;
  urgency_reason?: string;
  ordered_steps: ActionStep[];
  required_documents: string[];
  target_authority?: string;
  expected_timeline?: string;
  warnings?: string[];
}

export interface SituationAnalysisResponse {
  id: string;
  situation_summary: string;
  detected_issue: string;
  category: string;
  predicted_category?: string;
  predicted_category_name?: string;
  category_confidence?: string;
  category_reasoning?: string;
  reassurance_message?: string;
  urgency_level?: string;
  urgency_reason?: string;
  applicable_rights_or_schemes: RightOrSchemeItem[];
  eligibility_assessment?: string;
  action_plan: ActionPlan;
  recommended_draft_type?: string;
  sources: SourceReference[];
  disclaimer: string;
  is_demo: boolean;
  suggested_lawyers?: SuggestedLawyer[];
}

export interface ExtractedFact {
  fact: string;
  confidence?: string;
  category?: string;
}

export interface DocumentAnalysisResponse {
  id: string;
  filename: string;
  document_type: string;
  title?: string;
  summary: string;
  extracted_facts: ExtractedFact[];
  explicit_dates: string[];
  explicit_deadlines: string[];
  general_legal_deadlines?: string[];
  identified_issues: string[];
  required_documents: string[];
  optional_supporting_evidence?: string[];
  recommended_actions: string[];
  immediate_action?: string;
  possible_next_steps?: string[];
  potentially_applicable_rights?: RightOrSchemeItem[];
  verified_sources?: SourceReference[];
  recommended_draft_type?: string;
  is_demo: boolean;
  provider?: string;
  mode?: string;
  suggested_lawyers?: SuggestedLawyer[];
}

export interface DraftRequest {
  draft_type: string;
  case_summary: string;
  user_details?: Record<string, string>;
  target_authority?: string;
  specific_demands?: string[];
}

export interface DraftResponse {
  draft_id: string;
  draft_type: string;
  title: string;
  content: string;
  placeholders_used: string[];
  editable: boolean;
  disclaimer: string;
}

export interface SchemeCheckRequest {
  scheme_name: string;
  user_criteria?: Record<string, string>;
  location?: string;
  language?: string;
}

export interface CriterionAssessment {
  criterion: string;
  requirement: string;
  your_status: string;
  met: "yes" | "no" | "unknown";
}

export interface SchemeCheckResponse {
  scheme_name: string;
  verdict: "eligible" | "likely_eligible" | "likely_ineligible" | "needs_info";
  plain_language_summary?: string;
  known_criteria: string[];
  criterion_assessment: CriterionAssessment[];
  missing_information: string[];
  eligible_assessment: string;
  required_documents: string[];
  next_action: string;
  follow_up_questions?: string[];
  source_url?: string;
  is_demo: boolean;
}

export interface InterviewQuestion {
  field_key: string;
  question: string;
  answer_type: string;
  options?: string[];
  required?: boolean;
  help_text?: string;
}

export interface InterviewStartRequest {
  draft_type: string;
  case_summary: string;
}

export interface InterviewStartResponse {
  interview_id: string;
  draft_type: string;
  title: string;
  questions: InterviewQuestion[];
}

export interface InterviewSubmitRequest {
  interview_id?: string;
  draft_type: string;
  case_summary: string;
  answers?: Record<string, string>;
  target_authority?: string;
  specific_demands?: string[];
}

export interface AuthorityRouting {
  authority_name: string;
  department: string;
  jurisdiction?: string;
  submission_method?: string;
  portal_url?: string;
  notes?: string;
}
