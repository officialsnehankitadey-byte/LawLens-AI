from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.retrieval.service import RetrievalService

router = APIRouter()
retrieval_service = RetrievalService()

@router.get("/rights/search")
async def search_rights(query: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    return retrieval_service.search_rights(query=query or "", category=category)
