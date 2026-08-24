from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from app.models.schemas import DocumentAnalysisResponse
from app.services.document.processor import DocumentProcessor
from app.services.ai import build_ai_provider

router = APIRouter()

MAX_FILE_SIZE_MB = 10


@router.post("/analyze/document", response_model=DocumentAnalysisResponse)
async def analyze_document(request: Request, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")
    
    # Check file size via Content-Length header before reading
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE_MB}MB.")

    try:
        content_bytes = await file.read()
        # Double-check after read (in case Content-Length was missing/spoofed)
        if len(content_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE_MB}MB.")
        extracted_text = DocumentProcessor.extract_text(file.filename, content_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    provider = build_ai_provider()
    return await provider.analyze_document(file.filename, extracted_text)
