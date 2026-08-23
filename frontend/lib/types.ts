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
  description: string;
  why_it_matters: string;
  required_documents?: string[];
  authority?: string;
  submission_method?: string;
}

export interface ActionPlan {
  immediate_action: string;
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
