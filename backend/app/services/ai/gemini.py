import json
import logging
import uuid
from app.services.ai.base import AIProvider
from app.services.ai.fallback import FallbackProvider
from app.services.document.analyzer import DocumentAnalyzer
from app.services.lawyer_service import LawyerService
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
        if "cyber" in t or "it act" in t or "1930" in t:
            return "https://cybercrime.gov.in"
        elif "consumer" in t or "redressal" in t or "defect" in t or "nch" in t:
            return "https://consumerhelpline.gov.in"
        elif "rti" in t or "information" in t:
            return "https://rtionline.gov.in"
        elif "daakhil" in t or "commission" in t:
            return "https://e-daakhil.nic.in"
        elif "scheme" in t or "welfare" in t or "yojana" in t:
            return "https://myscheme.gov.in"
        elif "pgportal" in t or "grievance" in t or "cpgrams" in t:
            return "https://pgportal.gov.in"
        elif "bns" in t or "police" in t or "mha" in t:
            return "https://mha.gov.in"
        elif "rera" in t:
            return "https://mohua.gov.in"
        return "https://legislative.gov.in"

    # ------------------------------------------------------------------ #
    #  PROBLEM ANALYSIS
    # ------------------------------------------------------------------ #
    async def analyze_problem(self, request: ProblemRequest) -> SituationAnalysisResponse:
        if not self.is_available():
            return await self._fallback_or_secondary("analyze_problem", request)

        prompt = f"""You are LawLens AI ΓÇö a friendly, reassuring legal and civic empowerment assistant for Indian citizens.
Your job is to explain complex Indian laws (BNS/BNSS, Consumer Protection Act, IT Act, etc.) in VERY SIMPLE, PLAIN, EASY-TO-UNDERSTAND language that any regular person can understand immediately without feeling overwhelmed.

Problem: {request.problem}
Location: {request.location or "India"}

CRITICAL INSTRUCTIONS:
1. TONE & READABILITY: Use clear, simple, conversational language. Avoid dense legal jargon. Explain terms simply.
2. REASSURANCE & PEACE OF MIND: If the user is facing a scary situation (e.g. cyber theft, police harassment, landlord eviction, divorce, notice), give them a calming, reassuring message telling them they are protected by law and what immediate steps will keep them safe.
3. CONCRETE ACTION GUIDANCE: Clearly guide them on what to do next ΓÇö e.g. whether they need to call a helpline (1930/1915), go to the police station, file on a website, or contact one of the suggested lawyers.

Analyze the problem and return a JSON object ONLY (no markdown, no code fences):
{{
  "predicted_category": "one of: criminal, consumer, cyber_crime, property_tenancy, family_matrimonial, rti, employment, corporate, civil",
  "predicted_category_name": "Friendly category name e.g. Cyber Fraud & Online Theft / Criminal Defense & Police Matters / Consumer Complaints & Refunds",
  "category_confidence": "high",
  "category_reasoning": "Simple 1-2 sentence explanation of why this category applies in everyday words",
  "reassurance_message": "Warm, calming reassurance message for the user assuring them of their legal rights and that this can be resolved",
  "urgency_level": "one of: high_urgency, moderate, standard",
  "urgency_reason": "Why this urgency level applies in simple words (e.g. 'Act within 24 hours to increase chances of freezing transferred money')",
  "situation_summary": "Simple one-sentence summary of what happened in plain words",
  "detected_issue": "Concise, simple title of the issue",
  "user_provided_facts": ["Key fact stated by user"],
  "applicable_rights_or_schemes": [
    {{
      "topic": "Name of Law / Section in simple words",
      "explanation": "What this right gives you in plain, everyday language",
      "relevance_reason": "How this directly protects you right now",
      "authority": "Authority name",
      "action_recommended": "Simple action you can take under this right"
    }}
  ],
  "action_plan": {{
    "immediate_action": "The single easiest & most important thing to do right now",
    "reassurance_message": "Same reassuring message",
    "urgency_level": "one of: high_urgency, moderate, standard",
    "urgency_reason": "Urgency reason",
    "ordered_steps": [
      {{
        "step_number": 1,
        "title": "Short, clear action title (e.g. Call Helpline 1930 / Visit Local Police Station / File on NCH Portal)",
        "simple_summary": "1 simple sentence: what to do right now",
        "description": "Clear step-by-step instructions in simple language on how to do this",
        "action_type": "one of: call_helpline, go_to_police, contact_lawyer, online_portal, gather_documents, send_notice",
        "why_it_matters": "Why this step helps you in simple terms",
        "practical_tip": "A handy practical insider tip (e.g. 'Ask for an acknowledgment receipt / GD number before leaving')",
        "required_documents": ["Simple document name e.g. Bank statement PDF, Screenshot of WhatsApp chat"]
      }}
    ],
    "required_documents": ["Simple document 1", "Simple document 2"],
    "target_authority": "Plain name of authority or court",
    "expected_timeline": "Realistic timeline in plain words (e.g. 7 to 15 days)",
    "warnings": ["Simple caution or what NOT to do"]
  }},
  "recommended_draft_type": "one of: rti, consumer_complaint, grievance, appeal, police_complaint, legal_notice",
  "disclaimer": "LawLens AI provides helpful civic information. For formal court representation, consult a qualified lawyer."
}}

Legal Accuracy Rules:
- Consumer complaints can be filed directly without mandatory legal notice.
- Criminal matters: Mention BNS / BNSS & IPC / CrPC in simple terms.
- Cyber crime: Emphasize dialing 1930 & reporting on cybercrime.gov.in immediately.

Respond ONLY with valid JSON.
"""
        try:
            raw = self._complete(prompt)
            # Strip markdown fences if model includes them
            if "```" in raw:
                parts = raw.split("```")
                raw = parts[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw.strip())

            pred_cat = data.get("predicted_category", "consumer").lower().strip()
            cat_name = data.get("predicted_category_name") or pred_cat.replace("_", " ").title()

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
            reassurance = data.get("reassurance_message") or raw_plan.get("reassurance_message") or "You have clear rights under Indian law. Follow these practical steps calmly to protect your interests."
            urgency = data.get("urgency_level") or raw_plan.get("urgency_level") or "moderate"
            urgency_reason = data.get("urgency_reason") or raw_plan.get("urgency_reason")

            steps = [
                ActionStep(
                    step_number=s.get("step_number", i + 1),
                    title=s.get("title", ""),
                    simple_summary=s.get("simple_summary") or s.get("title", ""),
                    description=s.get("description", ""),
                    action_type=s.get("action_type", "general"),
                    why_it_matters=s.get("why_it_matters", ""),
                    practical_tip=s.get("practical_tip"),
                    required_documents=s.get("required_documents", [])
                )
                for i, s in enumerate(raw_plan.get("ordered_steps", []))
            ]
            plan = ActionPlan(
                immediate_action=raw_plan.get("immediate_action", "Gather and organize all relevant documents and evidence."),
                reassurance_message=reassurance,
                urgency_level=urgency,
                urgency_reason=urgency_reason,
                ordered_steps=steps,
                required_documents=raw_plan.get("required_documents", [d for s in steps for d in s.required_documents]),
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

            # Fetch 5 verified real Indian lawyers based on predicted category and location
            suggested_lawyers = LawyerService.get_suggested_lawyers(
                category=pred_cat,
                location=request.location,
                limit=5
            )

            return SituationAnalysisResponse(
                id=str(uuid.uuid4()),
                situation_summary=data.get("situation_summary", request.problem[:140]),
                detected_issue=data.get("detected_issue", "Civic / Legal Grievance"),
                category=pred_cat,
                predicted_category=pred_cat,
                predicted_category_name=cat_name,
                category_confidence=data.get("category_confidence", "high"),
                category_reasoning=data.get("category_reasoning", "Identified based on factual circumstances and relevant statutes."),
                reassurance_message=reassurance,
                urgency_level=urgency,
                urgency_reason=urgency_reason,
                applicable_rights_or_schemes=rights,
                action_plan=plan,
                recommended_draft_type=data.get("recommended_draft_type", "grievance"),
                sources=sources,
                disclaimer=data.get("disclaimer", "LawLens AI provides structured civic and legal guidance for educational purposes. Consult a verified advocate for formal representation."),
                is_demo=False,
                suggested_lawyers=suggested_lawyers
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

        prompt = f"""You are LawLens AI ΓÇö a civic and legal document analyst for Indian citizens.
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
- Do NOT state that sending a legal notice is a mandatory or required prerequisite before filing a consumer complaint. A formal legal notice is an optional pre-litigation step ΓÇö frame it as such if mentioned at all.
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
                "VERIFIED APPLICANT DETAILS (use these directly in the letter ΓÇö do NOT put "
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

        prompt = f"""You are LawLens AI ΓÇö a legal drafting assistant for Indian citizens.
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
- Do NOT include any preamble or explanation ΓÇö output ONLY the letter text.
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

        prompt = f"""You are LawLens AI ΓÇö a government scheme eligibility analyst for Indian citizens.
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
  "source_url": "Official government URL for this scheme (myscheme.gov.in or the ministry portal). Never invent URLs ΓÇö use https://myscheme.gov.in if unsure."
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
                "eligible": "Eligible ΓÇö you meet the known criteria.",
                "likely_eligible": "Likely Eligible ΓÇö subject to document verification.",
                "likely_ineligible": "Likely Not Eligible based on the details provided.",
                "needs_info": "Cannot determine yet ΓÇö more information needed.",
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
