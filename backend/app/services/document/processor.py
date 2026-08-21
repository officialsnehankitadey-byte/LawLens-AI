import io
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """
    Handles file upload validation, text extraction for PDF, DOCX, and TXT files.
    """
    MAX_FILE_SIZE_MB = 10
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

    @staticmethod
    def extract_text(filename: str, content_bytes: bytes) -> str:
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        
        if ext not in DocumentProcessor.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file type: {ext}. Allowed formats: PDF, DOCX, TXT")

        if len(content_bytes) > DocumentProcessor.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise ValueError(f"File size exceeds maximum limit of {DocumentProcessor.MAX_FILE_SIZE_MB}MB.")

        if ext == ".txt":
            return content_bytes.decode("utf-8", errors="ignore")

        if ext == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                text = "\n".join([page.extract_text() or "" for page in reader.pages])
                return text.strip()
            except Exception as e:
                logger.warning(f"pypdf extraction error ({e}); attempting fallback text decode.")
                return content_bytes.decode("utf-8", errors="ignore")

        if ext == ".docx":
            try:
                import docx
                doc = docx.Document(io.BytesIO(content_bytes))
                text = "\n".join([p.text for p in doc.paragraphs])
                return text.strip()
            except Exception as e:
                logger.warning(f"python-docx extraction error ({e}).")
                return content_bytes.decode("utf-8", errors="ignore")

        return content_bytes.decode("utf-8", errors="ignore")
