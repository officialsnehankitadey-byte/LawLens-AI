from fastapi import APIRouter

router = APIRouter()

@router.get("/history")
async def get_history():
    return {
        "message": "MVP History is persisted in client-side localStorage. No personal data stored server-side.",
        "items": []
    }
