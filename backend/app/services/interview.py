"""
Conversational Form-Filler

Generates a smart interview for the user based on the type of official
application they need, then folds their answers into a pre-filled draft.

Question banks are deterministic so the interview never breaks; the AI layer
is only used at submission time to weave the answers into a polished draft.
"""

from typing import List

from app.models.schemas import InterviewQuestion


# Common applicant identity questions for every form
COMMON_QUESTIONS: List[InterviewQuestion] = [
    InterviewQuestion(
        field_key="full_name",
        question="What is your full name (as it should appear on the application)?",
        answer_type="text",
        required=True,
        help_text="Use the spelling from your government ID.",
    ),
    InterviewQuestion(
        field_key="address",
        question="What is your postal address?",
        answer_type="textarea",
        required=True,
    ),
    InterviewQuestion(
        field_key="phone",
        question="Your contact phone number?",
        answer_type="tel",
        help_text="Optional, but speeds up official follow-up.",
    ),
]

DRAFT_SPECIFIC: dict = {
    "rti": [
        InterviewQuestion(
            field_key="information_sought",
            question="State precisely what information or records you want.",
            answer_type="textarea",
            required=True,
            help_text="Be specific — e.g. 'Copies of bills and measurement books for road work W-123 executed in 2025'.",
        ),
        InterviewQuestion(
            field_key="period_of_records",
            question="Which time period should the records cover?",
            answer_type="text",
            help_text="e.g. January 2025 to August 2026",
        ),
        InterviewQuestion(
            field_key="format_needed",
            question="In what format do you want the information?",
            answer_type="select",
            options=["Photocopies", "Certified copies", "Inspection of records", "Electronic (email/USB)"],
        ),
        InterviewQuestion(
            field_key="below_poverty_line",
            question="Are you below the poverty line (BPL)?",
            answer_type="select",
            options=["No", "Yes"],
            help_text="BPL applicants are exempt from the Rs 10 fee.",
        ),
    ],
    "consumer_complaint": [
        InterviewQuestion(
            field_key="opposite_party",
            question="Full name and address of the seller/company you are complaining against?",
            answer_type="textarea",
            required=True,
        ),
        InterviewQuestion(
            field_key="purchase_date",
            question="When did you purchase the product / avail the service?",
            answer_type="date",
        ),
        InterviewQuestion(
            field_key="amount_paid",
            question="How much did you pay? (in rupees)",
            answer_type="number",
            help_text="Determines which Consumer Commission has jurisdiction.",
        ),
        InterviewQuestion(
            field_key="relief_sought",
            question="What do you want as resolution?",
            answer_type="select",
            options=["Refund", "Replacement", "Repair", "Compensation for loss/injury", "Combination of the above"],
            required=True,
        ),
        InterviewQuestion(
            field_key="evidence_available",
            question="List the evidence you have (invoice, chats, photos, emails...)",
            answer_type="textarea",
        ),
    ],
    "grievance": [
        InterviewQuestion(
            field_key="office_addressed",
            question="Which office/department is the grievance against?",
            answer_type="text",
            required=True,
        ),
        InterviewQuestion(
            field_key="previous_complaint_ref",
            question="Any previous complaint number/reference?",
            answer_type="text",
            help_text="Leave blank if this is your first complaint.",
        ),
        InterviewQuestion(
            field_key="expected_resolution",
            question="What specific action do you expect the department to take?",
            answer_type="textarea",
            required=True,
        ),
    ],
    "appeal": [
        InterviewQuestion(
            field_key="decision_being_appealed",
            question="What decision/order are you appealing against?",
            answer_type="textarea",
            required=True,
        ),
        InterviewQuestion(
            field_key="decision_date",
            question="Date you received that decision?",
            answer_type="date",
            help_text="Appeal windows are strict (commonly 30 days).",
        ),
        InterviewQuestion(
            field_key="grounds_of_appeal",
            question="On what grounds do you challenge the decision?",
            answer_type="textarea",
            required=True,
        ),
    ],
}

TITLES = {
    "rti": "Right to Information Application",
    "consumer_complaint": "Consumer Complaint",
    "grievance": "Civic Grievance",
    "appeal": "First Appeal",
}


def get_interview_questions(draft_type: str) -> List[InterviewQuestion]:
    dt = draft_type.lower().strip()
    return COMMON_QUESTIONS + DRAFT_SPECIFIC.get(dt, [])


def get_title(draft_type: str) -> str:
    return TITLES.get(draft_type.lower().strip(), "Official Civic Application")
