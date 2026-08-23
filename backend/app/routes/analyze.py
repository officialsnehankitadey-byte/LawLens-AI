from fastapi import APIRouter, HTTPException
from app.models.schemas import ProblemRequest, SituationAnalysisResponse, AuthorityRouting
from app.services.ai import build_ai_provider
from app.services.authority import AuthorityRouter

router = APIRouter()


def attach_authority_routing(
    response: SituationAnalysisResponse,
    category: str,
    problem_text: str,
    location: str | None,
) -> SituationAnalysisResponse:
    """Resolve the correct government department and enrich the response.

    Fills action_plan.target_authority when the AI omitted it, and always
    attaches structured routing info (portal, submission method, notes).
    """
    try:
        routing = AuthorityRouter.route(category, problem_text or "", location)
        response.authority_routing = routing
        if not response.action_plan.target_authority:
            response.action_plan.target_authority = routing.authority_name
    except Exception:
        pass  # Routing is an enhancement; never fail the analysis over it.
    return response


@router.post("/analyze/problem", response_model=SituationAnalysisResponse)
async def analyze_problem(request: ProblemRequest):
    if not request.problem or not request.problem.strip():
        raise HTTPException(status_code=400, detail="Problem description cannot be empty.")
    provider = build_ai_provider()
    result = await provider.analyze_problem(request)
    return attach_authority_routing(result, request.category, request.problem, request.location)


@router.get("/authority/route", response_model=AuthorityRouting)
async def route_authority(category: str = "other", text: str = "", location: str | None = None):
    """Department Router — resolve the right authority for any civic issue."""
    return AuthorityRouter.route(category, text, location)
