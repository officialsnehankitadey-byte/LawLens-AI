import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_document_txt_with_extracted_entities():
    content = (
        b"Government Notice. Ref No: REF/2026/99. Dated: 2026-11-15.\n"
        b"To: Smt. Anjali Roy\n"
        b"Subject: Show Cause Notice regarding land verification.\n"
        b"You are requested to submit copy of income certificate within 20 days."
    )
    response = client.post(
        "/api/analyze/document",
        files={"file": ("notice.txt", io.BytesIO(content), "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "notice.txt"
    assert "2026-11-15" in data["explicit_dates"]
    assert any("within 20 days" in dl.lower() for dl in data["explicit_deadlines"])
    
    facts_str = " ".join(f["fact"] for f in data["extracted_facts"])
    assert "Anjali Roy" in facts_str
    assert "REF/2026/99" in facts_str

def test_analyze_document_txt_without_dates_or_deadlines():
    content = b"Generic plain text document without any date or deadline mentions."
    response = client.post(
        "/api/analyze/document",
        files={"file": ("plain.txt", io.BytesIO(content), "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["explicit_dates"] == []
    assert data["explicit_deadlines"] == []
    # Verify no hardcoded dates exist
    assert "2026-08-20" not in data["explicit_dates"]
    assert "Within 15 days of notice receipt" not in data["explicit_deadlines"]

def test_analyze_document_unsupported_extension():
    content = b"Binary data"
    response = client.post(
        "/api/analyze/document",
        files={"file": ("test.exe", io.BytesIO(content), "application/octet-stream")}
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_analyze_lawlens_test_notice_pdf():
    import os
    pdf_path = r"C:\Users\KIIT\Downloads\LawLens_Test_Notice.pdf"
    if not os.path.exists(pdf_path):
        pytest.skip("Test PDF file not found at Downloads path")

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    response = client.post(
        "/api/analyze/document",
        files={"file": ("LawLens_Test_Notice.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["filename"] == "LawLens_Test_Notice.pdf"
    assert "Notice" in data["document_type"]
    assert "15 August 2026" in data["explicit_dates"]
    assert any("30 days" in dl for dl in data["explicit_deadlines"])

    facts_str = " ".join(f["fact"] for f in data["extracted_facts"])
    assert "Rahul Sharma" in facts_str
    assert "LS/TEST/2026/0815" in facts_str
    assert "proof of residence" in facts_str.lower() or "residence" in facts_str.lower()
    assert "income certificate" in facts_str.lower()


def test_analyze_document_replacement_request_without_seller_response():
    content = (
        b"Consumer Purchase Receipt & Complaint.\n"
        b"Purchased item from BrightCart. Requesting replacement for defective unit."
    )
    response = client.post(
        "/api/analyze/document",
        files={"file": ("complaint.txt", io.BytesIO(content), "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()
    # Identified issues should not assert unsupported refusal or failure by seller
    issues = [str(i).lower() for i in data["identified_issues"]]
    assert not any("failed to provide" in i or "refused" in i for i in issues)


def test_real_document_facts_are_preserved_not_replaced_with_demo_data():
    """
    When a user uploads a real document, the analysis must reflect the
    actual document content. Document-specific facts like 'headphones stopped
    charging after five days' and 'seller did not provide a replacement after
    the initial request' must appear in the extracted_facts or summary.
    Unrelated demo facts such as 'damaged goods', 'delivered in a damaged state',
    or 'seller refusal emails' must NOT be injected from hardcoded templates.
    """
    content = (
        b"Consumer Complaint.\n"
        b"I purchased wireless headphones from QuickMart on 2026-08-01.\n"
        b"The headphones stopped charging after five days of purchase.\n"
        b"I contacted the seller and requested a replacement.\n"
        b"The seller did not provide a replacement after the initial request.\n"
        b"I am seeking resolution under the Consumer Protection Act, 2019.\n"
    )
    response = client.post(
        "/api/analyze/document",
        files={"file": ("headphone_complaint.txt", io.BytesIO(content), "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()

    # is_demo must be False — this is a real document
    assert data["is_demo"] is False, "is_demo should be False for a real uploaded document"

    # The response must reference the actual file and document content
    assert data["filename"] == "headphone_complaint.txt"
    assert "headphones" in data["summary"].lower() or "quickmart" in data["summary"].lower()

    # Facts extracted must reflect actual document content
    facts_str = " ".join(f["fact"] for f in data["extracted_facts"]).lower()

    # Key fact 1: headphones stopped charging after five days
    assert "charging" in facts_str or "stopped" in facts_str, (
        "Extracted facts must reflect the actual defect (stopped charging) from the document"
    )

    # Key fact 2: seller response (did not provide replacement after initial request)
    # This is captured verbatim from document, not inferred
    assert "seller" in facts_str or "replacement" in facts_str or "initial request" in facts_str, (
        "Extracted facts must reflect the seller's response as stated in the document"
    )

    # Unrelated demo facts must NOT appear
    demo_phrases = ["damaged goods", "delivered in a damaged state", "seller refusal emails"]
    for phrase in demo_phrases:
        assert phrase not in data["summary"].lower(), (
            f"Demo phrase '{phrase}' must not appear in the summary of a real document analysis"
        )


def test_test1_welfare_notice_grounding():
    """
    TEST 1 — WELFARE NOTICE:
    Validates that Rahul Sharma's welfare notice extracts facts accurately,
    identifies 30-day deadline, required docs, and does NOT claim application
    is rejected or mandate an appeal.
    """
    content = (
        b"Government Service Application Notice.\n"
        b"Applicant: Rahul Sharma\n"
        b"Reference Number: LS/TEST/2026/0815\n"
        b"Application Date: 10 August 2026\n"
        b"Notice Date: 15 August 2026\n"
        b"Subject: Clarification and Verification of Application.\n"
        b"You are requested to submit the following documents within 30 days from the date of the notice:\n"
        b"1. Valid proof of residence\n"
        b"2. Income certificate\n"
        b"3. Copy of original application acknowledgement\n"
    )
    response = client.post(
        "/api/analyze/document",
        files={"file": ("welfare_notice.txt", io.BytesIO(content), "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()

    facts_str = " ".join(f["fact"] for f in data["extracted_facts"])
    assert "Rahul Sharma" in facts_str
    assert "LS/TEST/2026/0815" in facts_str

    assert "10 August 2026" in data["explicit_dates"]
    assert "15 August 2026" in data["explicit_dates"]
    assert any("30 days" in dl.lower() for dl in data["explicit_deadlines"])

    req_docs_str = " ".join(data["required_documents"]).lower()
    assert "residence" in req_docs_str
    assert "income certificate" in req_docs_str or "income" in req_docs_str
    assert "acknowledgement" in req_docs_str or "application" in req_docs_str

    # Must NOT claim application has been rejected
    summary_and_issues = (data["summary"] + " " + " ".join(data["identified_issues"])).lower()
    assert "rejected" not in summary_and_issues
    assert "rejection" not in summary_and_issues

    # Must NOT mandate an appeal in immediate action
    assert "appeal" not in (data.get("immediate_action") or "").lower()


def test_test2_consumer_complaint_grounding():
    """
    TEST 2 — CONSUMER COMPLAINT:
    Validates that Ananya Mehta's consumer complaint extracts facts accurately,
    identifies 10-day deadline, required docs, and does NOT inject unsupported escalation.
    """
    content = (
        b"Consumer Complaint Notice & Evidence Request.\n"
        b"Complainant: Ananya Mehta\n"
        b"Seller: BrightCart Online Services\n"
        b"Product: Wireless Noise-Cancelling Headphones\n"
        b"Purchase Date: 2 August 2026\n"
        b"Complaint Date: 18 August 2026\n"
        b"Reference: CC/2026/0942\n"
        b"\n"
        b"The headphones stopped charging after five days of use.\n"
        b"The seller did not provide a replacement after the initial request.\n"
        b"\n"
        b"To proceed with review, the user must provide:\n"
        b"1. Purchase invoice/order confirmation\n"
        b"2. Photos/video showing the defect\n"
        b"3. Previous communication with the seller\n"
        b"\n"
        b"These records must be submitted within 10 days from the date of the notice.\n"
        b"After receiving the records, the complaint will be reviewed and the complainant will be informed of the next step.\n"
    )
    response = client.post(
        "/api/analyze/document",
        files={"file": ("consumer_complaint.txt", io.BytesIO(content), "text/plain")}
    )
    assert response.status_code == 200
    data = response.json()

    facts_str = " ".join(f["fact"] for f in data["extracted_facts"])
    assert "Ananya Mehta" in facts_str
    assert "BrightCart" in facts_str
    assert "CC/2026/0942" in facts_str

    assert "2 August 2026" in data["explicit_dates"]
    assert "18 August 2026" in data["explicit_dates"]
    assert any("10 days" in dl.lower() for dl in data["explicit_deadlines"])

    # Must NOT invent generic 15/30/45 day deadlines
    for dl in data["explicit_deadlines"]:
        assert "15 days" not in dl.lower()
        assert "30 days" not in dl.lower()

    # Check required documents
    req_docs_str = " ".join(data["required_documents"]).lower()
    assert "invoice" in req_docs_str or "confirmation" in req_docs_str
    assert "photos" in req_docs_str or "defect" in req_docs_str or "video" in req_docs_str
    assert "communication" in req_docs_str or "seller" in req_docs_str

    # Must NOT add unrequested docs like Bank statement, Aadhaar, PAN
    assert "bank statement" not in req_docs_str
    assert "aadhaar" not in req_docs_str
    assert "pan" not in req_docs_str

    # Title check: must describe actual issue, e.g. Defective Goods / Product
    title = (data.get("title") or "").lower()
    assert "defective" in title or "consumer" in title or "replacement" in title
    assert "mandatory refund" not in title
    assert "court complaint" not in title

    # Check Provider metadata is present
    assert "provider" in data
    assert data["provider"] in ["gemini", "fallback"]




