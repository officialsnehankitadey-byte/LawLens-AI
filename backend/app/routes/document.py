from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.models.schemas import DocumentAnalysisResponse
from app.services.document.processor import DocumentProcessor
from app.services.ai.gemini import GeminiProvider
from app.services.ai.fallback import FallbackProvider

router = APIRouter()

def get_ai_provider():
    if settings.GEMINI_API_KEY:
        return GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
    return FallbackProvider()

@router.post("/analyze/document", response_model=DocumentAnalysisResponse)
async def analyze_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")
    
    try:
        content_bytes = await file.read()
        extracted_text = DocumentProcessor.extract_text(file.filename, content_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    provider = get_ai_provider()
    return await provider.analyze_document(file.filename, extracted_text)
