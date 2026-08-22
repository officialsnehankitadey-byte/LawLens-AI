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
                extracted_pages = []
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    extracted_pages.append(page_text)
                text = "\n".join(extracted_pages)
            except Exception as e:
                logger.error(f"Failed to extract PDF text with pypdf: {e}")
                raise ValueError(f"Could not extract readable text from PDF: {str(e)}")

            # Normalize control/non-printable characters (e.g. \x7f bullet points converted to hyphen)
            import re
            text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', ' - ', text)

            # Safeguard: Verify the extracted text is clean text, not raw PDF internal objects/binary stream
            clean_text = text.strip()
            if not clean_text or clean_text.startswith("%PDF-") or "/Subtype" in clean_text or "/Font" in clean_text:
                raise ValueError("PDF text extraction produced unreadable binary data. Please upload a standard text PDF.")

            return clean_text

        if ext == ".docx":
            try:
                import docx
                doc = docx.Document(io.BytesIO(content_bytes))
                text = "\n".join([p.text for p in doc.paragraphs if p.text])
                return text.strip()
            except Exception as e:
                logger.error(f"python-docx extraction error ({e}).")
                raise ValueError(f"Failed to process DOCX file: {str(e)}")

        return content_bytes.decode("utf-8", errors="ignore").strip()
