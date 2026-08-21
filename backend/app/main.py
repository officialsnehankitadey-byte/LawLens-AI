from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, analyze, document, rights, schemes, action_plan, draft, history

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LawLens AI Backend — Action Engine for Civic and Legal Empowerment"
)

# Configure CORS Middleware
origins = [origin.strip() for origin in settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api prefix
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(document.router, prefix="/api", tags=["Document Analysis"])
app.include_router(rights.router, prefix="/api", tags=["Rights Navigator"])
app.include_router(schemes.router, prefix="/api", tags=["Scheme Checker"])
app.include_router(action_plan.router, prefix="/api", tags=["Action Plan"])
app.include_router(draft.router, prefix="/api", tags=["Draft Generator"])
app.include_router(history.router, prefix="/api", tags=["History"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to LawLens AI API",
        "docs": "/docs",
        "health": "/api/health"
    }
