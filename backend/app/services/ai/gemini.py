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
    DraftRequest, DraftResponse
)

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    """
    Google Gemini API Provider using the google-genai SDK (v2+).
    Falls back to FallbackProvider on init failure or runtime errors.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-3.6-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = FallbackProvider()
        self.client = None

        if api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=api_key)
                logger.info(f"Gemini client initialized with model: {model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}. Using FallbackProvider.")
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
        if not self.client:
            return await self.fallback.analyze_problem(request)

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
            from google import genai
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            raw = response.text.strip()
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
            return await self.fallback.analyze_problem(request)

    # ------------------------------------------------------------------ #
    #  DOCUMENT ANALYSIS
    # ------------------------------------------------------------------ #
    async def analyze_document(self, filename: str, content: str) -> DocumentAnalysisResponse:
        if not self.client:
            return await self.fallback.analyze_document(filename, content)

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
  "document_type": "Precise document type (e.g., Consumer Complaint Acknowledgment, Government Notice, RTI Application, etc.)",
  "title": "Descriptive title of the actual issue in the document (e.g. 'Defective Goods & Consumer Redressal', 'Defective Product & Unresolved Replacement Request', 'Application Clarification & Document Verification Notice'). Do NOT use titles like 'Mandatory Refund', 'Refund Refusal', 'Compensation Claim', 'Legal Notice', or 'Court Complaint' unless explicitly present in the document text.",
  "summary": "Factual 2-3 sentence summary generated STRICTLY from document facts. If a consumer submitted a complaint regarding defective goods and seller requested evidence, state '[Complainant] submitted a complaint regarding [Product] purchased from [Seller]. [Seller] requested [Required Docs] within [Deadline] so the complaint can be reviewed.' Do NOT say '[Complainant] received a notice from [Seller]' unless the document explicitly establishes that framing.",
  "extracted_facts": [
    {{
      "fact": "Fact explicitly stated in document text (e.g., Complainant: Ananya Mehta, Seller: BrightCart Online Services, Product: Wireless Noise-Cancelling Headphones, Defect: stopped charging after five days of use, Seller response: seller did not provide a replacement after initial request)",
      "confidence": "high",
      "category": "document_fact"
    }}
  ],
  "explicit_dates": ["Explicit date found in text"],
  "explicit_deadlines": ["Explicit document deadline stated in text (e.g. '10 days from the date of the notice'). Return [] if no deadline is present in text."],
  "general_legal_deadlines": [],
  "identified_issues": ["Short title describing actual issue in document"],
  "required_documents": ["ONLY list items explicitly requested in the document text. Do NOT add unrequested documents like Bank statement, Aadhaar, PAN, ID proof, or Payment transaction statement."],
  "optional_supporting_evidence": ["Optional extra documents that AI suggests might be useful as supporting evidence"],
  "immediate_action": "Single immediate action grounded strictly in the document request (e.g., 'Submit requested invoice/order confirmation, defect photos/video, and previous communication to BrightCart Online Services within the 10-day deadline stated in the document.')",
  "possible_next_steps": ["Optional next steps if unresolved after submitting evidence (e.g. 'If the issue remains unresolved after the requested evidence is submitted, consider contacting the National Consumer Helpline or appropriate consumer grievance authority.')"],
  "potentially_applicable_rights": [
    {{
      "topic": "Name of law/right (e.g. Consumer Rights under Consumer Protection Act, 2019)",
      "explanation": "Cautious explanation using 'may', 'potentially applicable', 'depending on facts'",
      "relevance_reason": "Why this legal framework may apply",
      "authority": "Relevant authority name (e.g., Consumer Commission having appropriate jurisdiction)",
      "action_recommended": "Optional recommended action",
      "source_url": "https://consumerhelpline.gov.in"
    }}
  ],
  "verified_sources": [
    {{
      "source_name": "National Consumer Helpline (NCH)",
      "title": "Consumer Grievance Portal",
      "url": "https://consumerhelpline.gov.in",
      "relevance": "High",
      "verification_status": "verified"
    }}
  ],
  "recommended_draft_type": "one of: rti, consumer_complaint, grievance, appeal"
}}

STRICT GROUNDING RULES (MUST FOLLOW):
1. LAW LENS MUST NEVER PRESENT AN INFERENCE AS A DOCUMENT FACT.
2. Every result must distinguish between:
   - DOCUMENT-DERIVED FACTS (Facts explicitly found in uploaded document)
   - LEGAL / CIVIC GUIDANCE (General guidance retrieved from legal sources)
   - INFERENCE (AI interpretation)
3. DOCUMENT DEADLINE: Include ONLY deadlines explicitly stated in the document text. If none, explicit_deadlines must be []. Do NOT invent 15-day, 30-day, or 45-day generic deadlines.
4. REQUIRED DOCUMENTS: Include ONLY documents explicitly requested in the document text. Put extra AI suggestions under optional_supporting_evidence.
5. NO UNSUPPORTED LEGAL ESCALATION: Do NOT automatically tell the user to file a court case, file an appeal, send a mandatory legal notice, or demand a refund unless explicitly stated in the document or framed as optional next steps.
6. Use cautious legal language: 'may', 'potentially applicable', 'depending on the facts', 'verify applicable requirements'.
7. Do NOT fabricate URLs or citations. Use verified official URLs like https://consumerhelpline.gov.in, https://e-daakhil.nic.in, https://rtionline.gov.in, https://pgportal.gov.in.
8. Respond ONLY with valid JSON. No markdown code fences.
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            data = json.loads(raw.strip())

            # Parse extracted facts
            facts = [
                ExtractedFact(
                    fact=f.get("fact", "") if isinstance(f, dict) else str(f),
                    confidence=f.get("confidence", "high") if isinstance(f, dict) else "high",
                    category=f.get("category", "document_fact") if isinstance(f, dict) else "document_fact"
                )
                for f in data.get("extracted_facts", [])
                if (isinstance(f, dict) and f.get("fact")) or (isinstance(f, str) and f.strip())
            ]
            if not facts:
                facts = base.extracted_facts

            # Parse rights
            rights = [
                RightOrSchemeItem(
                    topic=r.get("topic", ""),
                    explanation=r.get("explanation", ""),
                    relevance_reason=r.get("relevance_reason", ""),
                    authority=r.get("authority"),
                    action_recommended=r.get("action_recommended", ""),
                    source_url=r.get("source_url") or self._resolve_official_url(r.get("topic", ""))
                )
                for r in data.get("potentially_applicable_rights", [])
                if isinstance(r, dict)
            ]
            if not rights:
                rights = base.potentially_applicable_rights

            # Parse sources
            sources = [
                SourceReference(
                    source_name=s.get("source_name", "Official Legal Portal"),
                    title=s.get("title", "Government Provision"),
                    url=s.get("url") or self._resolve_official_url(s.get("source_name", "")),
                    relevance=s.get("relevance", "High"),
                    verification_status=s.get("verification_status", "verified")
                )
                for s in data.get("verified_sources", [])
                if isinstance(s, dict)
            ]
            if not sources:
                sources = base.verified_sources

            # Combine actions
            immediate = data.get("immediate_action") or base.immediate_action
            next_steps = data.get("possible_next_steps") or base.possible_next_steps
            rec_actions = [immediate] + next_steps if immediate else base.recommended_actions

            return DocumentAnalysisResponse(
                id=base.id,
                filename=filename,
                document_type=data.get("document_type", base.document_type),
                title=data.get("title", base.title),
                summary=data.get("summary", base.summary),
                extracted_facts=facts,
                explicit_dates=data.get("explicit_dates", base.explicit_dates),
                explicit_deadlines=data.get("explicit_deadlines", base.explicit_deadlines),
                general_legal_deadlines=data.get("general_legal_deadlines", base.general_legal_deadlines),
                identified_issues=data.get("identified_issues", base.identified_issues),
                required_documents=data.get("required_documents", base.required_documents),
                optional_supporting_evidence=data.get("optional_supporting_evidence", base.optional_supporting_evidence),
                recommended_actions=rec_actions,
                immediate_action=immediate,
                possible_next_steps=next_steps,
                potentially_applicable_rights=rights,
                verified_sources=sources,
                recommended_draft_type=data.get("recommended_draft_type", base.recommended_draft_type),
                is_demo=False,
                provider="gemini",
                mode="ai"
            )

        except Exception as e:
            logger.error(f"Gemini analyze_document error: {e}")
            return base  # Return deterministic fallback result on failure

    # ------------------------------------------------------------------ #
    #  DRAFT GENERATION
    # ------------------------------------------------------------------ #
    async def generate_draft(self, request: DraftRequest) -> DraftResponse:
        if not self.client:
            return await self.fallback.generate_draft(request)

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

        prompt = f"""You are LawLens AI — a legal drafting assistant for Indian citizens.
Draft a professional {doc_type_desc} letter based on the following case summary.

Case Summary:
{request.case_summary}

{authorities_str}
{demands_str}

Requirements:
- Write a complete, formal letter in English suitable for submission to Indian government/legal authorities.
- Use formal salutation and closing.
- Use [PLACEHOLDER] for any field the user needs to fill in (name, address, date, etc.).
- Include clear subject line, body with facts, specific request/demand, and closing.
- Remove any statement that replacement was requested, refused, delayed, or not provided unless explicitly supported by the case summary or specific demands. Use only verified facts.
- The letter should be professionally formatted and legally appropriate.
- Do NOT include any preamble or explanation — output ONLY the letter text.
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            draft_content = response.text.strip()

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
            return await self.fallback.generate_draft(request)
