# LawLens AI --- Product Requirements Document (PRD)

**Version:** 1.0\
**Status:** Hackathon MVP\
**Track:** Track 3 --- AI for Civic and Legal Empowerment\
**Product:** LawLens AI\
**Primary Goal:** Help citizens understand civic/legal problems and turn
bureaucratic complexity into a clear, actionable path.

------------------------------------------------------------------------

## 1. Executive Summary

LawLens AI is an AI-powered civic and legal empowerment platform
designed to help citizens understand their rights, entitlements,
government procedures, and possible next actions.

The platform accepts either a plain-language description of a citizen's
problem or an uploaded civic/legal document. It analyzes the situation,
identifies potentially relevant rights, schemes, procedures, and
authorities, retrieves relevant verified information where available,
explains the situation in simple language, generates a step-by-step
action plan, identifies required documents, and can generate editable
drafts such as RTI applications, complaints, grievances, or appeals.

The product is intentionally designed as an **action engine rather than
a generic legal chatbot**.

> **Core promise:** From civic/legal confusion to a clear action plan.

The official challenge emphasizes helping citizens understand and act on
rights and entitlements, including consumer protections, tenant rights,
RTI access, welfare eligibility, and government forms. It also
identifies scattered information across PDFs, notices, and portals as a
major usability problem. The challenge explicitly welcomes open
reinterpretation of the bureaucracy-translation problem.

------------------------------------------------------------------------

# 2. Problem Statement

Citizens frequently encounter situations involving:

-   government schemes and eligibility
-   RTI requests
-   consumer complaints
-   tenant or rental disputes
-   government notices
-   rejected applications
-   missing documentation
-   grievance procedures
-   government forms and bureaucratic processes

The information needed to solve these problems is often distributed
across:

-   government websites
-   PDFs
-   official notices
-   forms
-   scheme documentation
-   departmental portals
-   legal/civic information

The challenge is not simply a lack of information. The larger problem is
that citizens often cannot quickly determine:

1.  What their situation means.
2.  Which right, entitlement, scheme, or process may apply.
3.  Whether they appear eligible.
4.  Which authority they should approach.
5.  Which documents they need.
6.  What they should do next.
7.  Which document or application they should submit.

LawLens converts this fragmented information into a guided action
pathway.

------------------------------------------------------------------------

# 3. Product Vision

## Vision

Build a trustworthy AI-powered civic action layer that makes complex
government and civic processes understandable and actionable for
ordinary citizens.

## Mission

Reduce the gap between:

**"I don't understand what this notice/process/right means."**

and

**"I know what I can do next."**

------------------------------------------------------------------------

# 4. Product Positioning

LawLens AI is **not** intended to replace lawyers, government officials,
or authoritative government portals.

It is a civic-information and action-assistance system that:

-   simplifies complex information
-   connects a citizen's situation with relevant information
-   identifies missing information
-   provides structured next steps
-   assists with drafting documents
-   points users toward authoritative sources

### Product differentiation

Generic legal AI:

> Ask a question → receive an answer.

LawLens:

> Describe/upload a problem → understand the situation → identify
> relevant rights/entitlements → verify against available sources →
> receive an action plan → identify required documents → generate an
> appropriate draft.

------------------------------------------------------------------------

# 5. Target Users

## Primary Users

### 5.1 Citizens

People who need help understanding:

-   government procedures
-   civic rights
-   consumer issues
-   tenant issues
-   RTI
-   welfare/scheme eligibility
-   government notices
-   application rejection or grievance processes

### 5.2 Digitally Less-Confident Citizens

Users who may understand their problem but struggle with:

-   bureaucratic terminology
-   long documents
-   complex forms
-   navigating government websites
-   determining which department to contact

### 5.3 Students / Young Adults

Users encountering civic/legal procedures for the first time and needing
plain-language guidance.

------------------------------------------------------------------------

# 6. Initial MVP Scope

The MVP will focus on a limited set of high-value civic/legal workflows
rather than attempting to cover every area of law.

### Core supported scenarios

1.  Consumer complaints
2.  RTI-related assistance
3.  Government scheme/service eligibility
4.  Government notices and rejection letters
5.  Tenant-related issues

### MVP modules

-   Problem Analyzer
-   Document Analyzer
-   Rights Navigator
-   Scheme Eligibility Reader
-   Action Plan Generator
-   Document Checklist
-   RTI/Application Draft Generator
-   Source/Evidence Display
-   Analysis History
-   Demo/Fallback Mode

------------------------------------------------------------------------

# 7. Core User Journey

## Journey A --- Describe a Problem

``` text
Landing Page
    ↓
Analyze My Problem
    ↓
Describe Situation
    ↓
Select Category
    ↓
Select Language
    ↓
Analyze
    ↓
Situation Analysis
    ↓
Relevant Rights / Schemes
    ↓
Source References
    ↓
Action Plan
    ↓
Required Documents
    ↓
Generate Draft
```

------------------------------------------------------------------------

## Journey B --- Upload a Document

``` text
Landing Page
    ↓
Upload Document
    ↓
Validate File
    ↓
Extract Text
    ↓
Identify Document Type
    ↓
Analyze Content
    ↓
Identify Important Facts
    ↓
Identify Explicit Dates / Deadlines
    ↓
Identify Potential Issues
    ↓
Action Plan
    ↓
Generate Appropriate Draft
```

------------------------------------------------------------------------

# 8. Functional Requirements

## FR-01 --- Problem Input

The system shall allow users to describe their civic/legal problem using
natural language.

### Inputs

-   problem description
-   category
-   optional location
-   preferred language

### Categories

-   Consumer
-   Tenant
-   RTI
-   Government Scheme
-   Government Service
-   Government Notice
-   Other

------------------------------------------------------------------------

## FR-02 --- Situation Analysis

The system shall analyze the user's description and produce structured
information including:

-   situation summary
-   detected issue
-   potentially applicable rights
-   potentially applicable schemes
-   eligibility/issue assessment
-   reasoning
-   recommended actions
-   required documents
-   possible authority
-   possible deadline where explicitly supported
-   recommended draft type
-   source references
-   disclaimer

The system must distinguish between:

-   information supported by retrieved sources
-   AI-generated interpretation
-   information requiring verification

------------------------------------------------------------------------

## FR-03 --- Document Upload

The system shall support appropriate civic/legal document uploads.

Initial supported formats:

-   PDF
-   TXT
-   DOCX where supported

The system shall:

-   validate file type
-   enforce upload size limits
-   sanitize filenames
-   reject unsupported files
-   extract text where possible
-   gracefully handle empty or unreadable documents

The system shall not claim OCR capability unless OCR is actually
implemented.

------------------------------------------------------------------------

## FR-04 --- Document Analysis

The document analyzer shall attempt to identify:

-   document type
-   summary
-   important facts
-   explicitly stated dates
-   explicitly stated deadlines
-   requested action
-   rejection reason where present
-   potentially relevant civic/legal issues
-   recommended next steps

The system must not invent facts absent from the document.

------------------------------------------------------------------------

## FR-05 --- Knowledge Retrieval

LawLens shall use a modular knowledge layer.

Each knowledge item may contain:

-   ID
-   title
-   category
-   jurisdiction
-   description
-   eligibility
-   required documents
-   authority
-   application method
-   source name
-   source URL
-   last verified date
-   keywords

The MVP may use a small curated local dataset.

The architecture shall allow replacement or extension with:

-   verified government datasets
-   public APIs
-   authoritative web sources
-   larger document collections

------------------------------------------------------------------------

## FR-06 --- Rights Navigator

The system shall identify potentially relevant civic/legal rights or
procedures based on the user's situation.

A result should contain:

-   relevant topic/right
-   plain-language explanation
-   why it may be relevant
-   authority where known
-   recommended action
-   authoritative source where available
-   verification status

------------------------------------------------------------------------

## FR-07 --- Scheme Eligibility Reader

The system shall help users understand whether they may meet the known
eligibility criteria of a selected or retrieved scheme/service.

The output shall include:

-   matched scheme/service
-   known eligibility factors
-   information still required
-   missing eligibility information
-   required documents
-   next action
-   authoritative source

The system must not represent uncertain eligibility as a guaranteed
determination.

------------------------------------------------------------------------

## FR-08 --- Action Plan Generator

This is a core differentiating feature.

The system shall convert analysis into an ordered action plan.

Each action step should include:

-   step number
-   title
-   description
-   why it matters
-   required documents
-   source reference where available

The overall action plan should include:

-   immediate action
-   ordered steps
-   required documents
-   authority
-   submission method
-   expected next stage
-   escalation option where supported
-   warnings
-   verification requirements

------------------------------------------------------------------------

## FR-09 --- Document Checklist

The system shall produce a clear checklist of documents required for the
recommended action.

Each document item should identify:

-   document name
-   whether it is mandatory/optional when known
-   why it is required
-   whether the user has indicated it is available

------------------------------------------------------------------------

## FR-10 --- Draft Generator

The system shall generate editable drafts for selected civic documents.

Initial draft types:

-   RTI application
-   consumer complaint
-   grievance/application
-   appeal/representation

Generated drafts shall:

-   use user-provided information
-   use verified retrieved context where applicable
-   use placeholders for missing personal details
-   never invent personal information
-   never invent departments or addresses
-   avoid unsupported legal sections
-   be editable
-   be copyable
-   support text export/download

------------------------------------------------------------------------

## FR-11 --- Source Transparency

Where sources are available, the system shall display them separately
from AI reasoning.

A source card should contain:

-   source name
-   title/topic
-   URL where verified
-   relevance
-   verification status

The product shall never display fabricated URLs or citations as
authoritative.

------------------------------------------------------------------------

## FR-12 --- Analysis History

For the MVP, recent analyses may be stored locally in the browser.

Users should be able to:

-   view previous analyses
-   reopen an analysis
-   delete an analysis
-   search/filter history where practical

No persistent server-side personal data storage is required for the MVP
unless explicitly implemented.

------------------------------------------------------------------------

## FR-13 --- Demo Mode

The product shall include a reliable demo/fallback mode.

Demo scenarios:

1.  Consumer complaint
2.  RTI request
3.  Scheme eligibility
4.  Government notice
5.  Tenant issue

Demo mode shall work even when:

-   the AI API is unavailable
-   the API key is missing
-   rate limits are reached
-   network connectivity fails

Demo content must be clearly labeled as sample/demo content.

------------------------------------------------------------------------

# 9. AI Requirements

## AI Provider

Primary provider:

-   Google Gemini API

Architecture:

``` text
AIProvider
├── GeminiProvider
└── FallbackProvider
```

The rest of the application must not depend directly on Gemini-specific
implementation details.

------------------------------------------------------------------------

## Structured AI Output

AI responses shall be generated in structured JSON and validated through
Pydantic models.

Malformed responses must not crash the backend.

Recovery strategy:

1.  Parse response.
2.  Validate schema.
3.  Attempt safe extraction if malformed.
4.  Retry once where appropriate.
5.  Use deterministic fallback when necessary.

------------------------------------------------------------------------

# 10. AI Safety Requirements

LawLens handles civic/legal information, so reliability and transparency
are core requirements.

The system shall:

-   never intentionally fabricate laws
-   never fabricate legal sections
-   never fabricate government schemes
-   never fabricate government URLs
-   never fabricate deadlines
-   never fabricate eligibility criteria
-   clearly identify uncertainty
-   distinguish source-backed information from inference
-   recommend verification when evidence is insufficient
-   provide a legal/civic information disclaimer

The AI must be positioned as:

> Civic Rights Research and Action Assistant

It must not claim to be:

-   a lawyer
-   a judge
-   a government official
-   an official government portal

------------------------------------------------------------------------

# 11. Fallback Architecture

The product must remain demonstrable without the AI provider.

``` text
User Request
     ↓
AI Service
     ↓
Gemini Available?
   /        \
 Yes         No
 ↓            ↓
Gemini      Fallback
 ↓            ↓
Structured Result
      ↓
Validation
      ↓
Frontend
```

Fallback mode should provide deterministic sample/demo results and
should never silently pretend that an AI-generated response was
produced.

------------------------------------------------------------------------

# 12. Non-Functional Requirements

## Performance

-   Landing page should load quickly.
-   API requests should expose loading states.
-   Long-running AI/document operations should provide progress
    feedback.
-   Large files should be rejected early.
-   The application should remain usable during AI delays.

## Reliability

-   API failures must produce user-friendly messages.
-   AI failures must trigger fallback where possible.
-   No single AI failure should crash the application.
-   Core demo functionality must work without external AI availability.

## Security

-   API keys must remain server-side.
-   `.env` must never be committed.
-   Uploaded files must be validated.
-   File size must be restricted.
-   Filenames must be sanitized.
-   Sensitive document content should not be unnecessarily logged.
-   Unsafe HTML rendering must be avoided.

## Accessibility

-   Keyboard-accessible controls
-   readable contrast
-   clear labels
-   meaningful error messages
-   responsive layouts
-   mobile-friendly interaction

## Responsiveness

The application should support:

-   desktop
-   tablet
-   mobile

------------------------------------------------------------------------

# 13. Technical Architecture

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Lucide
-   shadcn/ui where appropriate

## Backend

-   Python
-   FastAPI
-   Pydantic
-   Uvicorn
-   HTTPX
-   python-dotenv
-   document extraction libraries as required

## AI

-   Google Gemini
-   provider abstraction
-   structured output validation
-   deterministic fallback

## Testing

-   pytest
-   FastAPI TestClient
-   frontend lint
-   frontend build
-   integration/smoke testing

------------------------------------------------------------------------

# 14. Proposed Repository Structure

``` text
LawLens-AI/
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── analyze/
│   │   ├── document/
│   │   ├── results/
│   │   ├── draft/
│   │   ├── history/
│   │   └── about/
│   │
│   ├── components/
│   │   ├── landing/
│   │   ├── analysis/
│   │   ├── results/
│   │   ├── action-plan/
│   │   ├── document/
│   │   ├── draft/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   │   ├── ai/
│   │   ├── retrieval/
│   │   ├── document/
│   │   ├── analysis/
│   │   ├── actions/
│   │   └── drafting/
│   ├── models/
│   ├── prompts/
│   ├── knowledge/
│   ├── config/
│   └── requirements.txt
│
├── tests/
│   ├── backend/
│   └── integration/
│
├── .github/
│   └── workflows/
│
├── README.md
├── ARCHITECTURE.md
├── specifications.md
├── TASK_BREAKDOWN.md
├── AGENTS.md
├── .env.example
└── .gitignore
```

------------------------------------------------------------------------

# 15. API Requirements

## Health

``` http
GET /api/health
```

Returns backend health/status.

------------------------------------------------------------------------

## Problem Analysis

``` http
POST /api/analyze/problem
```

Input:

``` json
{
  "problem": "string",
  "category": "consumer",
  "location": "optional",
  "language": "en"
}
```

------------------------------------------------------------------------

## Document Analysis

``` http
POST /api/analyze/document
```

Multipart file upload.

------------------------------------------------------------------------

## Rights Search

``` http
GET /api/rights/search
```

Parameters may include:

-   query
-   category
-   jurisdiction

------------------------------------------------------------------------

## Scheme Check

``` http
POST /api/schemes/check
```

Accepts:

-   scheme
-   user-provided eligibility information

------------------------------------------------------------------------

## Action Plan

``` http
POST /api/action-plan/generate
```

Accepts an analyzed case and retrieved context.

------------------------------------------------------------------------

## Draft Generation

``` http
POST /api/draft/generate
```

Accepts:

-   draft type
-   analysis
-   action plan
-   user information

------------------------------------------------------------------------

## History

``` http
GET /api/history
```

and related client-side history operations for the MVP.

------------------------------------------------------------------------

# 16. Frontend Pages

## Landing Page `/`

Purpose:

-   explain LawLens
-   establish trust
-   communicate the value proposition
-   start the main workflow

Primary CTA:

**Analyze My Problem**

Secondary CTA:

**Upload a Document**

------------------------------------------------------------------------

## Analysis Page `/analyze`

Components:

-   problem input
-   category selector
-   language selector
-   optional location
-   analyze button
-   demo-case selector

------------------------------------------------------------------------

## Document Page `/document`

Components:

-   drag-and-drop upload
-   file validation
-   document preview/name
-   analyze button
-   extracted facts
-   action plan
-   draft generation

------------------------------------------------------------------------

## Results Page `/results/[id]`

Sections:

1.  Situation Summary
2.  Detected Issue
3.  Relevant Rights/Schemes
4.  What This Means
5.  Source References
6.  Action Plan
7.  Required Documents
8.  Authority
9.  Generate Draft

------------------------------------------------------------------------

## Draft Page `/draft`

Components:

-   draft type
-   generated document
-   editable text area
-   copy
-   download
-   regenerate

------------------------------------------------------------------------

## History Page `/history`

Features:

-   recent analyses
-   search/filter
-   reopen
-   delete

------------------------------------------------------------------------

## About Page `/about`

Include:

-   how LawLens works
-   limitations
-   privacy notes
-   civic/legal information disclaimer
-   source transparency explanation

------------------------------------------------------------------------

# 17. UI/UX Principles

LawLens should feel:

-   trustworthy
-   calm
-   accessible
-   professional
-   simple
-   civic-tech oriented

Avoid:

-   excessive gradients
-   excessive animations
-   cluttered dashboards
-   chatbot-only layouts
-   unexplained AI scores
-   fake statistics
-   legal intimidation

The interface should emphasize **action and clarity**.

------------------------------------------------------------------------

# 18. Key UX Pattern

The most important result should visually communicate:

``` text
YOUR SITUATION
       ↓
WHAT THIS MAY MEAN
       ↓
WHAT RIGHTS / SERVICES MAY APPLY
       ↓
WHAT YOU CAN DO
       ↓
DOCUMENTS YOU NEED
       ↓
WHERE TO GO
       ↓
GENERATE YOUR DOCUMENT
```

The user should never have to read a long AI response to discover the
next step.

------------------------------------------------------------------------

# 19. Demo Scenarios

## Scenario 1 --- Consumer Complaint

Input:

> "An online seller delivered a damaged product and refuses to provide a
> refund."

Expected demonstration:

-   understand situation
-   identify potentially relevant consumer process
-   explain next steps
-   list evidence/documents
-   generate complaint draft

------------------------------------------------------------------------

## Scenario 2 --- RTI

Input:

> "I want information about how funds were allocated to a local
> government project."

Expected demonstration:

-   explain RTI process
-   identify information required
-   generate RTI application
-   show source/verification information

------------------------------------------------------------------------

## Scenario 3 --- Scheme Eligibility

Input:

> "I want to know whether I may qualify for a government welfare
> scheme."

Expected demonstration:

-   identify required eligibility information
-   show known criteria
-   identify missing information
-   show required documents
-   explain next action

------------------------------------------------------------------------

## Scenario 4 --- Government Notice

Upload a sample government notice.

Expected demonstration:

-   document summary
-   important facts
-   explicitly stated deadline
-   requested action
-   action plan
-   draft generation where appropriate

------------------------------------------------------------------------

## Scenario 5 --- Tenant Issue

Input:

> "My landlord is refusing to return my security deposit."

Expected demonstration:

-   situation analysis
-   potentially relevant rights/process
-   evidence checklist
-   action plan
-   escalation path where supported

------------------------------------------------------------------------

# 20. Success Metrics for the Hackathon MVP

Because this is a hackathon, success should focus on demonstrable
product value.

### Product Metrics

-   A user can complete the main workflow without assistance.
-   A problem can be analyzed in a single interaction.
-   The result is structured rather than a long generic chatbot
    response.
-   The system produces a concrete action plan.
-   Required documents are clearly identified.
-   A usable draft can be generated.
-   Sources are distinguishable from AI reasoning.

### Reliability Metrics

-   Backend starts successfully.
-   Frontend builds successfully.
-   Core API tests pass.
-   AI failure does not crash the application.
-   Demo mode works without an API key.
-   No secret credentials are committed.

### Demo Metric

A judge should be able to understand the product's value within
approximately 30--60 seconds of seeing the main workflow.

------------------------------------------------------------------------

# 21. Out of Scope for MVP

The following should NOT be prioritized before the submission deadline:

-   complete coverage of Indian law
-   guaranteed legal advice
-   real legal representation
-   filing applications directly with government portals
-   autonomous communication with government departments
-   fully automated court processes
-   nationwide scheme database
-   production-grade identity verification
-   complex multi-user enterprise administration
-   large-scale persistent personal-data storage
-   advanced OCR unless explicitly implemented and tested
-   mobile native applications

These may be future extensions.

------------------------------------------------------------------------

# 22. Future Scope

Potential future capabilities include:

### Multilingual and Voice Interface

Support regional Indian languages and voice-first interaction for users
with lower digital literacy.

### Government Portal Integration

Where technically and legally appropriate, integrate verified public
government APIs and portals.

### Verified Knowledge Graph

Build a continuously maintained knowledge graph of:

-   rights
-   schemes
-   authorities
-   forms
-   documents
-   procedures
-   jurisdictions

### Personalized Civic Profile

Allow users to maintain reusable information such as:

-   state
-   district
-   household information
-   relevant documents

with strong privacy controls.

### Application Tracking

Allow users to track the status of civic applications and grievances
where integrations are available.

### Human Expert Escalation

Connect users to qualified legal/civic professionals for cases requiring
human judgment.

------------------------------------------------------------------------

# 23. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  AI hallucination                    Structured output + source
                                      grounding + uncertainty

  Incorrect legal guidance            Clear verification requirements and
                                      disclaimers

  Fake citations                      Only display verified source
                                      metadata

  API outage                          Deterministic fallback/demo mode

  Large document uploads              File size/type limits

  Sensitive document exposure         Minimal logging + secure processing

  Overly broad scope                  Focus on five MVP scenarios

  Generic chatbot perception          Emphasize action engine

  Complex UI                          Action-first information
                                      architecture

  Missing data                        Explicitly show what information is
                                      still needed
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 24. Privacy Principles

The MVP should follow data minimization.

The system should:

-   collect only necessary information
-   avoid unnecessary server-side storage
-   avoid logging sensitive document contents
-   keep API credentials server-side
-   explain how uploaded documents are processed
-   allow local history deletion
-   avoid using personal data for unrelated purposes

------------------------------------------------------------------------

# 25. Legal/Civic Disclaimer

LawLens provides general civic and legal information and
document-assistance support. It does not provide professional legal
advice, establish a lawyer-client relationship, or guarantee
eligibility, legal outcomes, or acceptance of any application.

Users should verify important information with the relevant official
authority or a qualified professional before taking consequential
action.

------------------------------------------------------------------------

# 26. Development Priorities

## P0 --- Must Have

-   project scaffold
-   frontend/backend integration
-   problem analysis
-   AI provider abstraction
-   fallback mode
-   structured AI output
-   action plan
-   source display
-   document upload
-   document analysis
-   draft generation
-   polished results page
-   demo scenarios
-   tests
-   README

## P1 --- Should Have

-   scheme eligibility workflow
-   rights search
-   analysis history
-   document export
-   improved error handling
-   responsive mobile layout

## P2 --- Future

-   voice
-   multilingual expansion
-   government API integration
-   application tracking
-   expert escalation
-   persistent user profiles

------------------------------------------------------------------------

# 27. Recommended Hackathon Demo Flow

The strongest live demo should use a single realistic problem.

### Opening

> "Most civic systems give citizens information. LawLens focuses on what
> the citizen can actually do next."

### Step 1

Enter:

> "An online seller delivered a damaged product and refuses to refund
> me."

### Step 2

LawLens analyzes the situation.

### Step 3

Show:

**What happened**

**Potentially relevant rights/process**

**Sources**

### Step 4

Click:

**Show My Action Plan**

Display a step-by-step sequence.

### Step 5

Show:

**Documents I Need**

### Step 6

Click:

**Generate Consumer Complaint**

### Step 7

Show editable draft.

### Closing

> "LawLens turns fragmented civic and legal information into a guided
> path from problem to action."

------------------------------------------------------------------------

# 28. Final Product Definition

LawLens AI should ultimately be understood as:

> **An AI-powered civic action engine that transforms a citizen's
> problem or bureaucratic document into understandable information,
> source-backed guidance, a concrete action plan, required-document
> checklist, and an editable civic document draft.**

The product's competitive advantage is not simply AI-generated legal
text.

Its core value is the chain:

``` text
Citizen Problem
      ↓
Understand
      ↓
Identify
      ↓
Verify
      ↓
Decide
      ↓
Act
      ↓
Generate
```

**LawLens AI --- From civic confusion to clear action.**
