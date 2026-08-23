"""
Authority / Department Router

Deterministically routes a civic or legal issue to the correct government
department, authority, and submission portal. Used to:
- Fill `target_authority` in action plans when the AI omits it.
- Address RTI applications to the right Public Information Officer.
- Pick the correct Consumer Commission tier based on claim amount.

This is intentionally rule-based (no AI) so routing never fails at demo time;
the AI layer can still refine wording around it.
"""

import re
from typing import Optional

from app.models.schemas import AuthorityRouting


class AuthorityRouter:
    # ------------------------------------------------------------------ #
    #  CONSUMER COMMISSION TIER (Consumer Protection Act, 2019)
    # ------------------------------------------------------------------ #
    @staticmethod
    def _parse_claim_amount(text: str) -> Optional[float]:
        t = text.lower().replace(",", "")
        m = re.search(r"(?:rs\.?|inr|₹)\s*([0-9]+(?:\.[0-9]+)?)\s*(lakh|lakhs|crore|crores|k)?", t)
        if not m:
            return None
        val = float(m.group(1))
        unit = m.group(2)
        if unit and "lakh" in unit:
            val *= 100_000
        elif unit and "crore" in unit:
            val *= 10_000_000
        elif unit == "k":
            val *= 1_000
        return val if val > 0 else None

    @staticmethod
    def _route_consumer(text: str, location: Optional[str]) -> AuthorityRouting:
        amount = AuthorityRouter._parse_claim_amount(text)
        loc = location or "your district"
        if amount is None or amount <= 5_000_000:  # up to Rs 50 lakh (2021 revision)
            commission = "District Consumer Disputes Redressal Commission"
            jurisdiction = f"{loc} (where you reside or where the opposite party conducts business)"
        elif amount <= 20_000_000:
            commission = "State Consumer Disputes Redressal Commission"
            jurisdiction = f"State of {location}" if location else "Your State"
        else:
            commission = "National Consumer Disputes Redressal Commission"
            jurisdiction = "New Delhi"
        return AuthorityRouting(
            authority_name=commission,
            department="Consumer Disputes Redressal Machinery under the Consumer Protection Act, 2019",
            jurisdiction=jurisdiction,
            submission_method="File online via e-Daakhil, or pre-litigate via the National Consumer Helpline (1915 / INGRAM app)",
            portal_url="https://e-daakhil.nic.in",
            notes="No court fee beyond nominal statutory fee; hearings are largely virtual. You may file without sending any legal notice first.",
        )

    # ------------------------------------------------------------------ #
    #  RTI SUBJECT-MATTER → DEPARTMENT MAP
    # ------------------------------------------------------------------ #
    RTI_SUBJECT_MAP = [
        (["road", "highway", "bridge", "flyover", "construction", "pwd", "infrastructure"], "Public Works Department / Ministry of Road Transport & Highways"),
        (["water", "sewerage", "drainage", "supply of drinking"], "Public Health Engineering Department / Municipal Water Board"),
        (["municipal", "garbage", "streetlight", "street light", "sanitation", "ward"], "Municipal Corporation / Urban Local Body"),
        (["hospital", "health", "medical", "pharmacy", "ayushman"], "Ministry of Health & Family Welfare / State Health Department"),
        (["school", "education", "university", "college", "scholarship", "exam"], "Department of School Education & Literacy / Higher Education"),
        (["police", "fir", "crime", "cctv", "law and order"], "State Police Headquarters / Home Department"),
        (["pension", "epfo", "provident", "pf account", "eps"], "Employees' Provident Fund Organisation / Ministry of Labour"),
        (["ration", "pds", "food supply", "fair price", "nfsa"], "Department of Food & Civil Supplies"),
        (["electricity", "power cut", "transformer", "discom", "bill"], "Electricity Distribution Company (DISCOM) / Energy Department"),
        (["land record", "khatauni", "mutation", "registry", "bhulekh", "revenue"], "Revenue Department / Office of the Tehsildar"),
        (["income tax", "gst", "tax refund", "pan card", "assessment"], "Income Tax Department / GST Council"),
        (["bank", "loan", "nbfc", "insurance claim", "deposit"], "Department of Financial Services / Banking Ombudsman (RBI)"),
        (["housing", "pm awas", "flat", "allotment"], "Ministry of Housing & Urban Affairs"),
        (["railway", "train", "irctc"], "Ministry of Railways"),
        (["post office", "passport", "aadhaar", "csc"], "Department of Posts / Ministry of External Affairs / UIDAI"),
        (["scheme", "yojana", "welfare", "beneficiary"], "Concerned Implementing Department of the Scheme"),
        (["environment", "pollution", "tree cutting", "encroachment"], "State Pollution Control Board / Forest Department"),
        (["labour", "wages", "salary", "workplace"], "Office of the Labour Commissioner"),
    ]

    @staticmethod
    def _route_rti(text: str, location: Optional[str]) -> AuthorityRouting:
        t = text.lower()
        dept = None
        for keywords, mapped in AuthorityRouter.RTI_SUBJECT_MAP:
            if any(k in t for k in keywords):
                dept = mapped
                break
        if dept is None:
            dept = "Concerned Public Authority holding the requested records"
        return AuthorityRouting(
            authority_name=f"The Public Information Officer (PIO), {dept}",
            department=dept,
            jurisdiction=f"{location} — apply to the office that holds the records, not your residence" if location else "The public authority that holds the requested records",
            submission_method="File online at rtionline.gov.in (Rs 10 fee) or by post addressed to the PIO",
            portal_url="https://rtionline.gov.in",
            notes="PIO must respond within 30 days (48 hours where life & liberty are involved). First appeal lies with the First Appellate Authority within the same department.",
        )

    # ------------------------------------------------------------------ #
    #  OTHER CATEGORIES
    # ------------------------------------------------------------------ #
    @staticmethod
    def _route_tenant(text: str, location: Optional[str]) -> AuthorityRouting:
        return AuthorityRouting(
            authority_name="Rent Authority (under the state Tenancy Act) / Civil Court having jurisdiction",
            department="Housing & Rent Regulation",
            jurisdiction=f"{location or 'the district'} where the rented premises are situated",
            submission_method="Application/petition before the Rent Authority; police assistance only via a court order",
            portal_url="https://myscheme.gov.in",
            notes="Security deposit recovery is a recoverable due; retain rent receipts, agreement, and move-out communication.",
        )

    @staticmethod
    def _route_workplace(text: str, location: Optional[str]) -> AuthorityRouting:
        return AuthorityRouting(
            authority_name="Office of the Labour Commissioner",
            department="Labour & Employment Department",
            jurisdiction=f"{location or 'the district'} where the workplace is located",
            submission_method="Shram Suvidha Portal / physical grievance before the Labour Officer",
            portal_url="https://shramsuvidha.gov.in",
            notes="Wage disputes may be routed through conciliation first; termination disputes go to the Labour Court.",
        )

    @staticmethod
    def _route_notice(text: str, location: Optional[str]) -> AuthorityRouting:
        t = text.lower()
        if "income tax" in t or "itr" in t or "section 143" in t or "notice u/s" in t:
            name, dept, url = "Income Tax Officer (jurisdictional AO)", "Income Tax Department", "https://www.incometax.gov.in"
            method = "Respond on the e-filing portal under 'Pending Actions → e-Proceedings'"
        elif "gst" in t:
            name, dept, url = "GST Officer (jurisdictional)", "Goods & Services Tax Network", "https://www.gst.gov.in"
            method = "Reply on the GST common portal under 'Notices'"
        else:
            name = "The issuing authority named in the notice"
            dept = "As per the notice header/letterhead"
            url = "https://pgportal.gov.in"
            method = "Reply in writing within the stated deadline; keep proof of dispatch"
        return AuthorityRouting(
            authority_name=name,
            department=dept,
            jurisdiction=None,
            submission_method=method,
            portal_url=url,
            notes="Never ignore a government notice deadline; seek an extension in writing instead.",
        )

    @staticmethod
    def _route_scheme(text: str, location: Optional[str]) -> AuthorityRouting:
        return AuthorityRouting(
            authority_name="Nodal Department / District Nodal Officer implementing the scheme",
            department="Scheme Implementation (Central or State)",
            jurisdiction=location,
            submission_method="Apply through the scheme's official portal or Common Service Centre (CSC)",
            portal_url="https://myscheme.gov.in",
            notes="myScheme lists eligibility and required documents for every central and state scheme.",
        )

    @staticmethod
    def route(category: str, text: str, location: Optional[str] = None) -> AuthorityRouting:
        cat = (category or "").lower()
        if cat in ("consumer",):
            return AuthorityRouter._route_consumer(text, location)
        if cat in ("rti",):
            return AuthorityRouter._route_rti(text, location)
        if cat in ("tenant",):
            return AuthorityRouter._route_tenant(text, location)
        if cat in ("workplace", "labour"):
            return AuthorityRouter._route_workplace(text, location)
        if cat in ("notice",):
            return AuthorityRouter._route_notice(text, location)
        if cat in ("scheme",):
            return AuthorityRouter._route_scheme(text, location)
        # Generic grievance default
        return AuthorityRouting(
            authority_name="Concerned Government Department (via CPGRAMS)",
            department="Public Grievance Redress",
            jurisdiction=location,
            submission_method="Lodge on CPGRAMS pgportal.gov.in; department must act within 30 days",
            portal_url="https://pgportal.gov.in",
            notes=None,
        )
