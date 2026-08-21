# LawLens AI — Civic & Legal Empowerment Platform

> **From civic/legal confusion to a clear, actionable path.**

LawLens AI is an AI-powered civic action engine designed to help citizens understand their rights, entitlements, government procedures, and required next steps. Rather than acting as a generic legal chatbot, LawLens turns fragmented information from documents, notices, and portals into structured action plans, document checklists, and editable drafts (such as RTI applications, consumer complaints, and appeals).

---

## 🌟 Key Scenarios Supported (MVP)

1. **Consumer Complaints**: Product defect, service delay, refund refusal assistance.
2. **RTI Requests**: Transparency requests for local government projects & fund allocation.
3. **Scheme Eligibility**: Checking criteria and missing documents for government welfare schemes.
4. **Government Notices**: Document extraction, explicit deadlines, and requested response actions.
5. **Tenant Disputes**: Security deposit recovery and tenant rights guidance.

---

## 🏗️ Tech Stack

* **Frontend**: Next.js 14+ (App Router, React 18, TypeScript), Tailwind CSS v3, Radix UI / `shadcn/ui`, `lucide-react`.
* **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, `pypdf`, `python-docx`, HTTPX.
* **Database**: SQLite (Dev) / PostgreSQL (Prod) with SQLAlchemy 2.0 ORM; ChromaDB for embedded vector RAG storage.
* **AI Provider**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`) with deterministic `FallbackProvider` for robust offline demo mode.

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ and `npm`
- Python 3.11+ and `pip` (or `venv`)
- (Optional) Docker & Docker Compose

### 1. Environment Setup

Copy `.env.example` files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Add your Google Gemini API key to `backend/.env` (or run without key to use Fallback Demo Mode):
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 2. Run Backend (FastAPI)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

### 3. Run Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at: `http://localhost:3000`

---

## 📁 Repository Structure

```text
LawLens-AI/
├── frontend/             # Next.js 14 Web Application
│   ├── app/              # App Router pages (/analyze, /document, /results, /draft, /history)
│   ├── components/       # Layout, Landing, Analysis, Action Plan, & Draft UI components
│   ├── lib/              # API client, TypeScript types, and utility functions
│   └── package.json
├── backend/              # FastAPI Python Microservice
│   ├── app/
│   │   ├── main.py       # FastAPI Entry Point & CORS Setup
│   │   ├── config.py     # Pydantic BaseSettings Config
│   │   ├── routes/       # API Endpoint Routers
│   │   ├── services/     # AI Provider (Gemini & Fallback), Document Processor, & RAG Retrieval
│   │   ├── models/       # Pydantic Request/Response Schemas
│   │   └── knowledge/    # Curated Civic Rights & Scheme Knowledge Datasets
│   ├── tests/            # Pytest test suite
│   └── requirements.txt
├── docker-compose.yml    # Container orchestration for local dev
├── TECH_STACK.md         # Detailed Tech Stack Specifications
└── README.md
```

---

## 🛡️ Privacy & Safety Disclaimer

LawLens AI provides general civic and legal information and document assistance. It does not provide formal legal representation or create a lawyer-client relationship. All critical information should be verified with official government authorities.
