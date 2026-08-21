# LawLens AI — Tech Stack Specification

This document outlines the technology stack for **LawLens AI**, an AI-powered civic and legal empowerment platform. The stack is designed to be practical, production-ready, highly performant, and aligned with the architectural specifications in the Product Requirements Document (PRD).

---

## 1. Frontend

* **Framework**: Next.js 14+ (App Router, React 18+, TypeScript)
* **Styling**: Tailwind CSS v3 for clean, accessible, and responsive civic UI
* **UI Components & Icons**: Radix UI primitives, `shadcn/ui`, and `lucide-react` icons
* **State & Data Fetching**: React Hooks, TanStack Query (`@tanstack/react-query`) or Axios for API state management, and browser `localStorage` for local analysis history

---

## 2. Backend

* **Language & Runtime**: Python 3.11+
* **Web Framework**: FastAPI (Async, high-performance web framework with automatic OpenAPI documentation)
* **ASGI Server**: Uvicorn
* **Data Validation & Schemas**: Pydantic v2 (Strict request/response contracts and AI response validation)
* **Document Processing**: `pypdf` / `pdfplumber` (PDF text extraction) and `python-docx` (DOCX extraction)
* **HTTP Client**: HTTPX (Async HTTP client for external integrations)

---

## 3. Database

* **Relational / Structured Storage**:
  * **Development / MVP**: SQLite with SQLAlchemy 2.0 ORM
  * **Production**: PostgreSQL (hosted via Supabase or Neon) with Alembic migration management
* **Vector Database (RAG Storage)**:
  * **ChromaDB**: Embedded vector store for semantic similarity search over curated civic schemes, RTI procedures, and consumer rights datasets

---

## 4. AI/LLM & RAG

* **Primary LLM Provider**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash` via `google-genai` / `google-generativeai` SDK)
* **Embeddings Model**: Google Gemini `text-embedding-004` or `sentence-transformers/all-MiniLM-L6-v2` for generating embeddings of legal and scheme documents
* **RAG Pipeline**: Custom Python retrieval service (`services/retrieval`) integrating ChromaDB, structured prompt engineering, and Pydantic response validation
* **Reliability & Fallback**: Modular `AIProvider` abstraction with an offline `FallbackProvider` to guarantee deterministic sample output during network/API downtime

---

## 5. Authentication

* **MVP**: Anonymous / Stateless access (Zero friction for citizens needing immediate civic assistance; local browser storage for personal analysis history)
* **Production**: NextAuth.js (Auth.js) on Next.js frontend with JWT (JSON Web Tokens) verification in FastAPI for multi-device history sync and saved drafts

---

## 6. APIs/Integrations

* **Internal API**: RESTful JSON HTTP endpoints between Next.js frontend and FastAPI backend:
  * `POST /api/analyze/problem` — Problem analysis & rights matching
  * `POST /api/analyze/document` — Multipart document upload & text extraction
  * `GET /api/rights/search` — Search civic rights & procedures
  * `POST /api/schemes/check` — Scheme eligibility checker
  * `POST /api/action-plan/generate` — Step-by-step action plan generation
  * `POST /api/draft/generate` — Editable civic document draft generator
  * `GET /api/health` — Health check endpoint
* **External AI API**: Google Gemini REST / gRPC API
* **Future Government APIs**: Open Government Data (OGD) Platform India / National Portal APIs via REST

---

## 7. Deployment

* **Frontend Hosting**: Vercel (Global Edge Network optimized for Next.js)
* **Backend Hosting**: Render / Railway / AWS App Runner (Containerized service execution)
* **Containerization**: Docker & Docker Compose for unified multi-stage local development and production deployments

---

## 8. Key Libraries & Dependencies

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.350.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "axios": "^1.6.8",
    "@tanstack/react-query": "^5.28.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

### Backend (`requirements.txt`)
```text
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
google-genai>=0.1.0
google-generativeai>=0.4.0
chromadb>=0.4.24
sentence-transformers>=2.5.0
pypdf>=4.1.0
python-docx>=1.1.0
python-multipart>=0.0.9
httpx>=0.27.0
python-dotenv>=1.0.1
sqlalchemy>=2.0.28
alembic>=1.13.1
pytest>=8.1.0
pytest-asyncio>=0.23.0
```
