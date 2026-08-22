import re
import uuid
from typing import List, Tuple
from app.models.schemas import DocumentAnalysisResponse, ExtractedFact

class DocumentAnalyzer:
    """
    Parses extracted document text dynamically to extract:
    - Notice / Document Date(s)
    - Explicit Deadlines / Timeframes
    - Applicant / Recipient Name
    - Reference / Notice / Order Number
    - Requested / Missing Documents
    - Requested Actions & Identified Issues
    - Document Type & Summary
    """

    @staticmethod
    def extract_dates(text: str) -> List[str]:
        patterns = [
            # 15 August 2026 or 12th August 2026
            r'\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4}\b',
            # DD/MM/YYYY or YYYY-MM-DD or DD-MM-YYYY
            r'\b(?:\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2}|\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})\b',
            # August 12, 2026
            r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b',
        ]
        
        found_dates: List[str] = []
        for pat in patterns:
            matches = re.findall(pat, text, re.IGNORECASE)
            for m in matches:
                clean_m = m.strip()
                if clean_m not in found_dates:
                    found_dates.append(clean_m)
                    
        return found_dates

    @staticmethod
    def extract_deadlines(text: str) -> List[str]:
        patterns = [
            r'\b(?:within|period of)\s+(?:\d+|one|two|three|four|five|ten|fifteen|twenty|thirty)\s+(?:days|weeks|months|years|working days)(?:\s+from\s+[\w\s]{2,40})?',
            r'\b(?:before|by|due date|deadline|last date)\s*[:\-]\s*[\w\s\d,/\-]{3,30}(?=\.|\n|,|;|$)',
            r'\b(?:reply|submit|respond|pay|file)\s+within\s+[\w\s\d,/\-]{2,40}(?=\.|\n|,|;|$)',
        ]
        
        deadlines: List[str] = []
        for pat in patterns:
            matches = re.findall(pat, text, re.IGNORECASE)
            for m in matches:
                clean = re.sub(r'\s+', ' ', m).strip()
                if clean and clean not in deadlines and len(clean) > 5:
                    deadlines.append(clean)
                    
        return deadlines

    @staticmethod
    def extract_applicant_name(text: str) -> str:
        # Check multiline "Applicant\n<Name>" pattern first
        m_line = re.search(r'Applicant\s*\n\s*([A-Z][a-zA-Z\s\.]{2,40})', text)
        if m_line:
            name = m_line.group(1).split('\n')[0].strip()
            if len(name) > 2 and name.lower() not in {"application", "type", "public", "notice"}:
                return name

        patterns = [
            r'\b(?:To|Applicant|Recipient|Name|Addressed\s+to|Issued\s+to)\s*[:\-]?\s*(?:Shri|Smt\.|Smt|Mr\.|Ms\.|Mrs\.|Dr\.)?\s*([A-Z][a-zA-Z\.\s]{2,40})(?=\n|\.|$)',
            r'\b(?:Shri|Smt\.|Smt|Mr\.|Ms\.|Mrs\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        ]
        for pat in patterns:
            match = re.search(pat, text)
            if match:
                name = match.group(1).split('\n')[0].strip()
                name = re.sub(r'^(?:Shri|Smt\.|Smt|Mr\.|Ms\.|Mrs\.|Dr\.)\s*', '', name).strip()
                if len(name) > 2 and name.lower() not in {"sir", "madam", "notice", "subject", "date", "application", "public"}:
                    return name
        return "Not identified"

    @staticmethod
    def extract_reference_number(text: str) -> str:
        # Multiline "Reference Number\n<Ref>" check
        m_line = re.search(r'Reference\s+Number\s*\n\s*([A-Za-z0-9/\-_]{3,35})', text, re.IGNORECASE)
        if m_line:
            return m_line.group(1).strip()

        # Uppercase pattern with slashes (e.g. LS/TEST/2026/0815 or REF/2026/99)
        m_slash = re.search(r'\b([A-Z]{2,6}/[A-Z0-9/\-_]{4,30})\b', text)
        if m_slash:
            return m_slash.group(1).strip()

        patterns = [
            r'\b(?:ref(?:\.|erence)?|notice|order|file|case|memo|letter|app(?:lication)?)\s*(?:no|number|num|#|\.)?\s*[:\-]\s*([A-Za-z0-9][A-Za-z0-9/\-_]{2,35})',
        ]
        for pat in patterns:
            matches = re.finditer(pat, text, re.IGNORECASE)
            for match in matches:
                ref = match.group(1).strip()
                if ref.lower() not in {"date", "notice", "number", "the", "with", "from", "sub", "subject"}:
                    if re.search(r'[\d/\-_]', ref) and len(ref) >= 3:
                        return ref
        return "Not identified"

    @staticmethod
    def extract_requested_documents(text: str) -> List[str]:
        """Returns a list of explicitly requested/missing documents from the document text."""
        # Check bulleted list after "Documents requested:" or "Missing documents:"
        m_list = re.search(r'(?:Documents\s+requested|Missing\s+documents?)\s*[:\-]?\s*\n((?:\s*[-\*\x7f•]\s*[^\n]+\n?)+)', text, re.IGNORECASE)
        if m_list:
            bullet_block = m_list.group(1)
            items = re.findall(r'[-\*\x7f•]\s*([^\n]+)', bullet_block)
            clean_items = [i.strip() for i in items if i.strip()]
            if clean_items:
                return clean_items

        # Inline missing documents text (single item)
        m_inline = re.search(r'missing\s+(?:a\s+)?([^\.\n]+)', text, re.IGNORECASE)
        if m_inline:
            doc_str = m_inline.group(1).strip()
            if len(doc_str) > 3 and len(doc_str) < 120:
                return [doc_str]

        return []

    @staticmethod
    def extract_key_facts_from_text(text: str) -> List[str]:
        """
        Extracts verbatim key facts from the document text — product defects,
        charging issues, seller responses, timelines — without fabricating any detail.
        Only facts explicitly stated in the text are returned.
        """
        facts: List[str] = []
        text_lower = text.lower()

        # Defect / malfunction facts
        defect_patterns = [
            r'((?:stopped|ceased|failed to|does not|not)\s+(?:charging|working|functioning|turning on|switch(?:ing)?\s+on)[^.\n]{0,80})',
            r'((?:defective|damaged|faulty|broken|malfunctioning)[^.\n]{0,80})',
            r'((?:product|device|item|unit|headphone|phone|laptop|appliance)[^.\n]{0,60}(?:stopped|failed|not working|broken|defect)[^.\n]{0,60})',
        ]
        for pat in defect_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                fact = re.sub(r'\s+', ' ', m.group(1)).strip().rstrip('.,;')
                if fact and fact not in facts:
                    facts.append(f"Reported issue: {fact}")
                break

        # Timeframe of defect (e.g., "after five days", "within 3 days")
        time_patterns = [
            r'(after\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:days?|weeks?|months?))',
            r'(within\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:days?|weeks?|months?)\s+of\s+(?:purchase|delivery|receipt))',
        ]
        for pat in time_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                fact = re.sub(r'\s+', ' ', m.group(1)).strip()
                if fact and fact not in facts:
                    facts.append(f"Defect timeframe stated: {fact}")
                break

        # Seller / company response facts
        seller_response_patterns = [
            r'(seller\s+did\s+not\s+provide[^.\n]{0,80})',
            r'(seller\s+(?:refused|denied|failed\s+to|has\s+not)[^.\n]{0,80})',
            r'((?:no|not\s+provided|not\s+given|not\s+received)\s+(?:replacement|refund|response|repair)[^.\n]{0,60})',
            r'((?:replacement|refund|repair)\s+(?:not\s+provided|was\s+denied|was\s+refused|not\s+received)[^.\n]{0,60})',
            r'(initial\s+request[^.\n]{0,80})',
        ]
        for pat in seller_response_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                fact = re.sub(r'\s+', ' ', m.group(1)).strip().rstrip('.,;')
                if fact and fact not in facts:
                    facts.append(f"Seller response as stated: {fact}")
                break

        # Product name / description
        product_patterns = [
            r'(?:purchased|bought|ordered)\s+(?:a\s+)?([a-zA-Z0-9\s\-]{3,60}?)\s+(?:from|on|via|at)',
        ]
        for pat in product_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                product = re.sub(r'\s+', ' ', m.group(1)).strip().rstrip('.,;')
                if product and 3 <= len(product) <= 60 and product not in facts:
                    facts.append(f"Product as stated: {product}")
                break

        return facts

    @staticmethod
    def extract_requested_action_and_issues(text: str) -> Tuple[List[str], List[str], str]:
        text_lower = text.lower()
        issues: List[str] = []
        actions: List[str] = []
        recommended_draft_type = "grievance"

        # Check for RTI strictly with word boundaries so "verification" / "certification" don't trigger it
        is_rti = bool(re.search(r'\brti\b', text_lower) or "right to information" in text_lower)

        if "missing" in text_lower or "documentation" in text_lower or "documents requested" in text_lower:
            issues.append("Incomplete Documentation / Missing Documents Notice")
            actions.append("Submit requested missing documents to the concerned department within the stated deadline.")
            recommended_draft_type = "grievance"

        if "show cause" in text_lower or ("notice" in text_lower and not issues):
            issues.append("Official Notice / Compliance Inquiry")
            actions.append("Prepare formal representation or response to notice.")
            recommended_draft_type = "appeal"

        if "rejection" in text_lower or "rejected" in text_lower or "refused" in text_lower:
            issues.append("Application Rejection / Refusal")
            actions.append("Review reasons for rejection and file first appeal.")
            recommended_draft_type = "appeal"

        if is_rti:
            issues.append("RTI Request / Official Information Inquiry")
            actions.append("File RTI application or First Appeal to Public Information Officer.")
            recommended_draft_type = "rti"

        if "consumer" in text_lower or "refund" in text_lower or "defect" in text_lower or "warranty" in text_lower or "replacement" in text_lower or "charging" in text_lower:
            # Build fact-grounded issue title based only on what is explicitly mentioned
            has_refund = "refund" in text_lower
            has_replacement = "replacement" in text_lower or "replace" in text_lower
            has_unresolved = "unresolved" in text_lower or "refused" in text_lower or "rejected" in text_lower or "delay" in text_lower
            if has_refund and has_replacement:
                consumer_issue_title = "Defective Product & Unresolved Replacement/Refund Request" if has_unresolved else "Defective Product & Replacement/Refund Request"
            elif has_refund:
                consumer_issue_title = "Defective Product & Refund Request"
            elif has_replacement:
                consumer_issue_title = "Defective Product & Unresolved Replacement Request" if has_unresolved else "Defective Product & Replacement Request"
            else:
                consumer_issue_title = "Defective Goods & Consumer Redressal"
            issues.append(consumer_issue_title)
            # Action grounded to the document's specific request
            if has_replacement and not has_refund:
                action_text = "Draft formal consumer grievance notice requesting replacement of the defective product."
            elif has_refund:
                action_text = "Draft formal consumer grievance notice requesting refund for the defective product."
            else:
                action_text = "Draft formal consumer grievance notice regarding the defective product."
            actions.append(action_text)
            actions.append(
                "Register complaint on the National Consumer Helpline (consumerhelpline.gov.in or call 1915)."
            )
            actions.append(
                "After submitting the requested evidence, if the issue remains unresolved, "
                "consider escalation to the appropriate Consumer Commission via the e-Daakhil portal."
            )
            recommended_draft_type = "consumer_complaint"

        if "tax" in text_lower or "dues" in text_lower or "bill" in text_lower or "payment" in text_lower:
            issues.append("Bill / Dues Verification")
            actions.append("Verify billing records and submit proof of payment if already settled.")

        if not issues:
            issues.append("General Civic / Administrative Document Review")
        if not actions:
            actions.append("Review key facts, verify dates, and submit formal representation if required.")

        return issues, actions, recommended_draft_type

    @classmethod
    def analyze(cls, filename: str, content: str) -> DocumentAnalysisResponse:
        clean_text = content.strip()
        
        # Extracted Dates & Deadlines
        dates = cls.extract_dates(clean_text)
        deadlines = cls.extract_deadlines(clean_text)

        # Extracted Fields
        applicant_name = cls.extract_applicant_name(clean_text)
        ref_no = cls.extract_reference_number(clean_text)
        requested_docs_list: List[str] = cls.extract_requested_documents(clean_text)
        requested_docs_str = ", ".join(requested_docs_list) if requested_docs_list else "Not identified"

        # Extracted Facts — always sourced from actual document content
        extracted_facts = []

        # Core structural fields
        extracted_facts.append(ExtractedFact(
            fact=f"Applicant Name: {applicant_name}",
            confidence="high" if applicant_name != "Not identified" else "low"
        ))
        extracted_facts.append(ExtractedFact(
            fact=f"Reference Number: {ref_no}",
            confidence="high" if ref_no != "Not identified" else "low"
        ))
        extracted_facts.append(ExtractedFact(
            fact=f"Requested/Missing Documents: {requested_docs_str}",
            confidence="high" if requested_docs_list else "low"
        ))

        # Document-specific key facts extracted verbatim from the uploaded content
        key_facts = cls.extract_key_facts_from_text(clean_text)
        for kf in key_facts:
            extracted_facts.append(ExtractedFact(fact=kf, confidence="high"))

        # Summary: use actual document snippet, never hardcoded demo text
        if clean_text:
            snippet = re.sub(r'\s+', ' ', clean_text[:250]).strip()
            summary = f"Extracted from '{filename}' ({len(clean_text)} characters): {snippet}..."
        else:
            summary = f"Parsed file '{filename}'. No text could be extracted."

        issues, actions, draft_type = cls.extract_requested_action_and_issues(clean_text)

        # Document Type classification
        filename_lower = filename.lower()
        clean_lower = clean_text.lower()

        if "government service application" in clean_lower or "welfare assistance" in clean_lower or "public welfare" in clean_lower:
            doc_type = "Government Service Application / Notice"
        elif "notice" in clean_lower or "notice" in filename_lower:
            doc_type = "Government / Official Notice"
        elif re.search(r'\brti\b', clean_lower) or "rti" in filename_lower:
            doc_type = "RTI Document"
        elif "invoice" in clean_lower or "bill" in clean_lower or "receipt" in clean_lower:
            doc_type = "Consumer Bill / Invoice"
        else:
            doc_type = "Civic / Official Document"

        # is_demo=False: this is analysis of a real uploaded document,
        # not a demo scenario. FallbackProvider.analyze_document() also
        # calls this method, so it will also correctly reflect is_demo=False
        # for real documents (FallbackProvider is only invoked when no
        # Gemini API key is available, but still processes the real content).
        return DocumentAnalysisResponse(
            id=str(uuid.uuid4()),
            filename=filename,
            document_type=doc_type,
            summary=summary,
            extracted_facts=extracted_facts,
            explicit_dates=dates,
            explicit_deadlines=deadlines,
            identified_issues=issues,
            required_documents=requested_docs_list,
            recommended_actions=actions,
            recommended_draft_type=draft_type,
            is_demo=False
        )

