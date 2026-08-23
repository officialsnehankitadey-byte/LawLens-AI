from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import LawyerSearchResponse
from app.services.lawyer_service import LawyerService

router = APIRouter()

@router.get("/lawyers/suggest", response_model=LawyerSearchResponse)
async def suggest_lawyers(
    category: Optional[str] = Query("criminal", description="Legal category e.g. criminal, consumer, cyber_crime, property_tenancy, family_matrimonial, rti, employment, corporate"),
    location: Optional[str] = Query(None, description="City or State e.g. Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune"),
    limit: int = Query(5, ge=1, le=10, description="Number of lawyers to retrieve")
):
    """
    Suggest verified real-time Indian advocates based on legal category and geographic location.
    """
    lawyers = LawyerService.get_suggested_lawyers(category=category, location=location, limit=limit)
    return LawyerSearchResponse(
        category=category or "general",
        location_searched=location,
        lawyers=lawyers
    )
