import json
import logging
import uuid
from app.services.ai.base import AIProvider
from app.services.ai.fallback import FallbackProvider
from app.services.document.analyzer import DocumentAnalyzer
from app.models.schemas import (
    ProblemRequest, SituationAnalysisResponse, RightOrSchemeItem,
    ActionPlan, ActionStep, SourceReference,
    DocumentAnalysisResponse, ExtractedFact,
    DraftRequest, DraftResponse,
    SchemeCheckRequest, SchemeCheckResponse, CriterionAssessment
)

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    """
    Google Gemini API Provider using the google-genai SDK (v2+).
    Falls back to FallbackProvider on init failure or runtime errors.
    An optional `secondary` provider (e.g. GroqProvider) is tried before
    falling back to deterministic demo mode.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-3.6-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = FallbackProvider()
        self.secondary = None
        self.client = None

        if api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=api_key)
                logger.info(f"Gemini client initialized with model: {model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}. Using FallbackProvider.")

    def is_available(self) -> bool:
        return self.client is not None

    def _complete(self, prompt: str) -> str:
        """Low-level single-shot text generation. Overridden by subclasses (e.g. GroqProvider)."""
        from google.genai import types

        # Disable/limit "thinking" for much lower latency; parameter differs by model generation.
        if self.model_name.lower().startswith("gemini-3"):
            thinking_config = types.ThinkingConfig(thinking_level="low")
        else:
            thinking_config = types.ThinkingConfig(thinking_budget=0)
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(thinking_config=thinking_config),
            )
        except Exception as e:
            if "thinking" in str(e).lower():
                # Model rejected the thinking config; retry without it.
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
            else:
                raise
        return response.text.strip()

    async def _fallback_or_secondary(self, method_name: str, *args):
        """Try the secondary provider chain, then the deterministic fallback provider."""
        if self.secondary is not None:
            try:
                return await getattr(self.secondary, method_name)(*args)
            except Exception as e:
                logger.error(f"Secondary provider {type(self.secondary).__name__} failed: {e}")
        return await getattr(self.fallback, method_name)(*args)
    @staticmethod
    def _resolve_official_url(topic_str: str) -> str:
        t = str(topic_str).lower()
        if "consumer" in t or "redressal" in t or "defect" in t or "nch" in t:
            return "https://consumerhelpline.gov.in"
        elif "rti" in t or "information" in t:
            return "https://rtionline.gov.in"
        elif "daakhil" in t or "commission" in t:
            return "https://e-daakhil.nic.in"
        elif "scheme" in t or "welfare" in t or "yojana" in t:
            return "https://myscheme.gov.in"
        elif "pgportal" in t or "grievance" in t or "cpgrams" in t:
            return "https://pgportal.gov.in"
        return "https://legislative.gov.in"

    # ------------------------------------------------------------------ #
    #  PROBLEM ANALYSIS
    # ------------------------------------------------------------------ #
    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        if not self.is_available():
            return await self._fallback_or_secondary("analyze_problem", request)

        prompt = f"""You are LawLens AI — a civic and legal empowerment assistant for Indian citizens.
Analyze the following problem and return a JSON object ONLY (no markdown, no explanation).

Problem: {request.problem}
Category: {request.category}
Location: {request.location or "India"}

Return this exact JSON structure:
{{
  "situation_summary": "One-sentence summary of the user's situation",
  "detected_issue": "Short title of the core legal/civic issue",
  "user_provided_facts": ["Fact directly mentioned by user"],
  "ai_inferences": ["Inference derived by AI"],
  "applicable_rights_or_schemes": [
    {{
      "topic": "Name of the law/scheme/right",
      "explanation": "What it is and how it helps",
      "relevance_reason": "Why it applies here",
      "authority": "Relevant authority name",
      "action_recommended": "What the user should do under this right"
    }}
  ],
  "action_plan": {{
    "immediate_action": "The single most important first step",
    "ordered_steps": [
      {{
        "step_number": 1,
        "title": "Step title",
        "description": "What to do",
        "why_it_matters": "Why this step is important"
      }}
    ],
    "required_documents": ["Document 1", "Document 2"],
    "target_authority": "Name of main authority to approach",
    "expected_timeline": "Realistic timeline",
    "warnings": ["Any important warnings"]
  }},
  "recommended_draft_type": "one of: rti, consumer_complaint, grievance, appeal",
  "disclaimer": "Standard disclaimer text"
}}

Legal Accuracy Rules (MUST follow):
- Do NOT state that sending a legal notice is a mandatory step or required prerequisite before filing a consumer complaint. Under the Consumer Protection Act 2019, a consumer may file a complaint directly without first sending a legal notice.
- You MAY mention that sending a formal legal notice can be a useful optional pre-litigation step that sometimes prompts resolution without formal proceedings, but always frame it as optional — never mandatory or required.
- Remove any statement that replacement was requested, refused, delayed, or not provided unless explicitly supported by the user's input or uploaded evidence. Use only verified facts. Do NOT mention replacement or state that replacement was requested, refused, delayed, or not provided unless that specific fact is explicitly supported by the user's input or uploaded evidence.
- When explaining consumer rights or remedies under the Consumer Protection Act, state that the Act provides consumers with rights and potential remedies, which may include repair, replacement, refund, or compensation depending on the facts and applicable law.
- For Step 2's "Why it matters" statement (and all deadline steps), do NOT claim that meeting the deadline prevents rejection or dismissal unless the notice or input expressly states that consequence. State that timely submission helps ensure the requested evidence is considered during processing.
- When describing the National Consumer Helpline (NCH), state: "NCH provides a government-operated pre-litigation grievance redress mechanism that can facilitate resolution with the concerned company." Do NOT describe NCH itself as mediation.
- Refer to the forum as "Consumer Commission having appropriate jurisdiction" rather than assuming "District Consumer Disputes Redressal Commission" unless jurisdiction has been determined from the available facts and applicable rules.
- For every important legal claim or right, include the official source URL (e.g., government portal, legislation, or court website) in the `source_url` field. If a reliable source cannot be verified, mark the claim as general guidance and set `verification_status` to "unverified".
- Do NOT fabricate citations; only provide URLs that can be verified.
- Never claim "High confidence" solely because a legal category appears obvious. Confidence must reflect both factual completeness and legal certainty; if important facts are missing, label the analysis accordingly.

Respond ONLY with valid JSON. No markdown code fences.
"""
        try:
            raw = self._complete(prompt)
            # Strip markdown fences if model includes them
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw.strip())

            rights = [
                RightOrSchemeItem(
                    topic=r.get("topic", ""),
                    explanation=r.get("explanation", ""),
                    relevance_reason=r.get("relevance_reason", ""),
                    authority=r.get("authority"),
                    action_recommended=r.get("action_recommended", ""),
                    source_url=r.get("source_url") or self._resolve_official_url(r.get("topic", ""))
                )
                for r in data.get("applicable_rights_or_schemes", [])
            ]

            raw_plan = data.get("action_plan", {})
            steps = [
                ActionStep(
                    step_number=s.get("step_number", i + 1),
                    title=s.get("title", ""),
                    description=s.get("description", ""),
                    why_it_matters=s.get("why_it_matters", "")
                )
                for i, s in enumerate(raw_plan.get("ordered_steps", []))
            ]
            plan = ActionPlan(
                immediate_action=raw_plan.get("immediate_action", "Review your case documents."),
                ordered_steps=steps,
                required_documents=raw_plan.get("required_documents", []),
                target_authority=raw_plan.get("target_authority"),
                expected_timeline=raw_plan.get("expected_timeline"),
                warnings=raw_plan.get("warnings", [])
            )

            sources = [
                SourceReference(
                    source_name=s.get("source_name", "Official Legal Portal"),
                    title=s.get("title", "Government Provision"),
                    url=s.get("url") or self._resolve_official_url(s.get("source_name", "")),
                    relevance=s.get("relevance", "High"),
                    verification_status=s.get("verification_status", "verified")
                )
                for s in data.get("sources", [])
            ]
            if not sources and rights:
                for r in rights:
                    if r.source_url:
                        sources.append(SourceReference(
                            source_name=r.topic,
                            title=f"Legal framework under {r.topic}",
                            url=r.source_url,
                            relevance="High",
                            verification_status="verified"
                        ))

            return SituationAnalysisResponse(
                id=str(uuid.uuid4()),
                situation_summary=data.get("situation_summary", request.problem[:120]),
                detected_issue=data.get("detected_issue", "Civic / Legal Issue"),
                category=request.category,
                applicable_rights_or_schemes=rights,
                action_plan=plan,
                recommended_draft_type=data.get("recommended_draft_type", "grievance"),
                sources=sources,
                disclaimer=data.get("disclaimer", "This is AI-generated civic information. Consult a legal professional for advice."),
                is_demo=False
            )

        except Exception as e:
            logger.error(f"Gemini analyze_problem error: {e}")
            return await self._fallback_or_secondary("analyze_problem", request)

    # ------------------------------------------------------------------ #
    #  DOCUMENT ANALYSIS
    # ------------------------------------------------------------------ #
    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        if not self.is_available():
            return await self._fallback_or_secondary("analyze_document", filename, content)

        # First run the deterministic extractor for reliable field extraction
        base = DocumentAnalyzer.analyze(filename, content)

        prompt = f"""You are LawLens AI — a civic and legal document analyst for Indian citizens.
Analyze the following document text extracted from '{filename}' and return a JSON object ONLY.

Document Text:
\"\"\"
{content[:4000]}
\"\"\"

Return this exact JSON structure:
{{
  "document_type": "Precise document type (e.g. Government Notice, Consumer Complaint, RTI Application, etc.)",
  "summary": "2-3 sentence summary of what this document is about and what it requires",
  "identified_issues": ["Issue 1", "Issue 2"],
  "required_documents": ["Doc 1", "Doc 2"],
  "recommended_actions": ["Action 1", "Action 2", "Action 3"],
  "recommended_draft_type": "one of: rti, consumer_complaint, grievance, appeal"
}}

Rules:
- CRITICAL: Base ALL output exclusively on the document text provided above. Do NOT use demo scenarios, template facts, or example data such as "damaged goods", "delivered in a damaged state", or "seller refusal emails" unless those exact phrases appear in the document text.
- Preserve verbatim facts from the document. If the document states the product "stopped charging after five days", preserve that exact fact. If the document states "seller did not provide a replacement after the initial request", preserve that exact fact.
- Only use Demo/Fallback Mode when no usable document text is available.
- Extract ONLY facts present in the document text. Do NOT invent dates, deadlines, names, or reference numbers.
- required_documents must ONLY list items explicitly requested in the document. If none, return [].
- Do not fabricate legal conclusions not supported by the text.
- Do NOT state that sending a legal notice is a mandatory or required prerequisite before filing a consumer complaint. A formal legal notice is an optional pre-litigation step — frame it as such if mentioned at all.
- Remove any statement that replacement was requested, refused, delayed, or not provided unless explicitly supported by the document text. Use only verified facts.
- For Step 2's "Why it matters" statement (and all deadline steps), do NOT claim that meeting the deadline prevents rejection or dismissal unless the notice expressly states that consequence. State that timely submission helps ensure the requested evidence is considered during processing.
- When describing the National Consumer Helpline (NCH), state: "NCH provides a government-operated pre-litigation grievance redress mechanism that can facilitate resolution with the concerned company." Do NOT describe NCH itself as mediation.
- Respond ONLY with valid JSON. No markdown code fences.
"""
        try:
            raw = self._complete(prompt)
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw.strip())

            return DocumentAnalysisResponse(
                id=base.id,
                filename=filename,
                document_type=data.get("document_type", base.document_type),
                summary=data.get("summary", base.summary),
                extracted_facts=base.extracted_facts,        # Keep deterministic facts
                explicit_dates=base.explicit_dates,          # Keep deterministic dates
                explicit_deadlines=base.explicit_deadlines,  # Keep deterministic deadlines
                identified_issues=data.get("identified_issues", base.identified_issues),
                required_documents=data.get("required_documents", base.required_documents),
                recommended_actions=data.get("recommended_actions", base.recommended_actions),
                recommended_draft_type=data.get("recommended_draft_type", base.recommended_draft_type),
                is_demo=False
            )

        except Exception as e:
            logger.error(f"Gemini analyze_document error: {e}")
            return await self._fallback_or_secondary("analyze_document", filename, content)

    # ------------------------------------------------------------------ #
    #  DRAFT GENERATION
    # ------------------------------------------------------------------ #
    async def generate_draft(self, request: DraftRequest) -> DraftResponse:
        if not self.is_available():
            return await self._fallback_or_secondary("generate_draft", request)

        type_descriptions = {
            "rti": "Right to Information (RTI) application under the RTI Act 2005",
            "consumer_complaint": "formal consumer grievance / legal notice under the Consumer Protection Act 2019",
            "grievance": "official civic grievance representation to a government authority",
            "appeal": "formal first appeal / representation challenging an administrative decision"
        }
        doc_type_desc = type_descriptions.get(request.draft_type.lower(), "official civic representation")

        authorities_str = f"Target Authority: {request.target_authority}" if request.target_authority else ""
        demands_str = ""
        if request.specific_demands:
            demands_str = "Specific demands to include:\n" + "\n".join(f"- {d}" for d in request.specific_demands)

        details_str = ""
        if request.user_details:
            details_str = (
                "VERIFIED APPLICANT DETAILS (use these directly in the letter — do NOT put "
                "placeholders for these fields):\n"
                + "\n".join(f"- {k.replace('_', ' ').title()}: {v}" for k, v in request.user_details.items())
                + "\n"
            )

        placeholder_rule = (
            "Only use [PLACEHOLDER] for fields the user has NOT provided. Every fact present in "
            "the verified details above must be written directly into the letter."
            if request.user_details
            else "Use [PLACEHOLDER] for any field the user needs to fill in (name, address, date, etc.)."
        )

        prompt = f"""You are LawLens AI — a legal drafting assistant for Indian citizens.
Draft a professional {doc_type_desc} letter based on the following case summary.

Case Summary:
{request.case_summary}

{authorities_str}
{demands_str}
{details_str}
Requirements:
- Write a complete, formal letter in English suitable for submission to Indian government/legal authorities.
- Use formal salutation and closing.
- {placeholder_rule}
- Include clear subject line, body with facts, specific request/demand, and closing.
- Remove any statement that replacement was requested, refused, delayed, or not provided unless explicitly supported by the case summary, verified details, or specific demands. Use only verified facts.
- The letter should be professionally formatted and legally appropriate.
- Do NOT include any preamble or explanation — output ONLY the letter text.
"""
        try:
            draft_content = self._complete(prompt)

            title_map = {
                "rti": "Application under Right to Information Act, 2005",
                "consumer_complaint": "Formal Consumer Grievance / Legal Notice",
                "grievance": "Representation / Official Civic Grievance",
                "appeal": "First Appeal / Formal Representation"
            }
            title = title_map.get(request.draft_type.lower(), "Official Civic Representation")

            # Extract placeholders from draft
            import re
            placeholders = re.findall(r'\[([^\]]+)\]', draft_content)
            placeholders = [f"[{p}]" for p in placeholders]

            return DraftResponse(
                draft_id=str(uuid.uuid4()),
                draft_type=request.draft_type,
                title=title,
                content=draft_content,
                placeholders_used=list(set(placeholders)),
                editable=True,
                disclaimer="AI-generated draft. Review all placeholders and verify legal accuracy before submitting."
            )

        except Exception as e:
            logger.error(f"Gemini generate_draft error: {e}")
            return await self._fallback_or_secondary("generate_draft", request)

    # ------------------------------------------------------------------ #
    #  SCHEME ELIGIBILITY CHECK
    # ------------------------------------------------------------------ #
    async def check_scheme_eligibility(self, request: SchemeCheckRequest) -> SchemeCheckResponse:
        if not self.is_available():
            return await self._fallback_or_secondary("check_scheme_eligibility", request)

        criteria_str = "\n".join(f"- {k}: {v}" for k, v in (request.user_criteria or {}).items()) or "- (no details provided)"
        lang_note = f"Write the plain_language_summary and questions in language code '{request.language}'." if request.language and request.language != "en" else ""

        prompt = f"""You are LawLens AI — a government scheme eligibility analyst for Indian citizens.
Evaluate whether the user is likely eligible for the scheme below. Return a JSON object ONLY.

Scheme: {request.scheme_name}
User Location: {request.location or "India"}
User-provided details:
{criteria_str}

Return this exact JSON structure:
{{
  "verdict": "one of: eligible, likely_eligible, likely_ineligible, needs_info",
  "plain_language_summary": "2-3 sentences in simple words explaining whether they qualify and why",
  "criteria_assessment": [
    {{
      "criterion": "e.g. Age limit",
      "requirement": "e.g. Between 18 and 40 years",
      "your_status": "What the user told us, or 'Not provided'",
      "met": "yes | no | unknown"
    }}
  ],
  "known_criteria": ["All official eligibility conditions of the scheme"],
  "missing_information": ["Facts needed from the user to be sure"],
  "required_documents": ["Documents typically required to apply"],
  "follow_up_questions": ["1-3 short questions whose answers would firm up the verdict"],
  "next_action": "Concrete next step for the user",
  "source_url": "Official government URL for this scheme (myscheme.gov.in or the ministry portal). Never invent URLs — use https://myscheme.gov.in if unsure."
}}

Rules:
- Base eligibility rules on your knowledge of Indian central/state schemes; if you are not certain the scheme exists, still analyse the closest well-known matching scheme and say so in plain_language_summary.
- Mark met as "unknown" rather than guessing when the user did not provide the fact.
- Do NOT fabricate specific income limits or dates; phrase them as approximations with "approximately" when unsure.
- {lang_note}
- Respond ONLY with valid JSON. No markdown code fences.
"""
        try:
            raw = self._complete(prompt)
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw.strip())

            criteria = [
                CriterionAssessment(
                    criterion=c.get("criterion", ""),
                    requirement=c.get("requirement", ""),
                    your_status=c.get("your_status", "Not provided"),
                    met=c.get("met", "unknown"),
                )
                for c in data.get("criteria_assessment", [])
            ]
            verdict = data.get("verdict", "needs_info")
            readable = {
                "eligible": "Eligible — you meet the known criteria.",
                "likely_eligible": "Likely Eligible — subject to document verification.",
                "likely_ineligible": "Likely Not Eligible based on the details provided.",
                "needs_info": "Cannot determine yet — more information needed.",
            }.get(verdict, verdict)

            return SchemeCheckResponse(
                scheme_name=request.scheme_name,
                verdict=verdict,
                plain_language_summary=data.get("plain_language_summary"),
                known_criteria=data.get("known_criteria", []),
                criterion_assessment=criteria,
                missing_information=data.get("missing_information", []),
                eligible_assessment=readable,
                required_documents=data.get("required_documents", []),
                next_action=data.get("next_action", "Check the official portal and gather required documents."),
                follow_up_questions=data.get("follow_up_questions", []),
                source_url=data.get("source_url") or "https://myscheme.gov.in",
                is_demo=False,
            )
        except Exception as e:
            logger.error(f"Gemini check_scheme_eligibility error: {e}")
            return await self._fallback_or_secondary("check_scheme_eligibility", request)
