export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  ai_provider: string;
  api_key_configured: boolean;
}

export interface ProblemRequest {
  problem: string;
  category: string;
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
  applicable_rights_or_schemes: RightOrSchemeItem[];
  eligibility_assessment?: string;
  action_plan: ActionPlan;
  recommended_draft_type?: string;
  sources: SourceReference[];
  disclaimer: string;
  is_demo: boolean;
}

export interface ExtractedFact {
  fact: string;
  confidence?: string;
}

export interface DocumentAnalysisResponse {
  id: string;
  filename: string;
  document_type: string;
  summary: string;
  extracted_facts: ExtractedFact[];
  explicit_dates: string[];
  explicit_deadlines: string[];
  identified_issues: string[];
  required_documents: string[];
  recommended_actions: string[];
  recommended_draft_type?: string;
  is_demo: boolean;
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
