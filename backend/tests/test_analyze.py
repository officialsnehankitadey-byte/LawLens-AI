import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_problem_endpoint():
    payload = {
        "problem": "Purchased an electronic item that stopped working within 3 days.",
        "category": "consumer",
        "location": "Delhi"
    }
    response = client.post("/api/analyze/problem", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "situation_summary" in data
    assert "detected_issue" in data
    assert "applicable_rights_or_schemes" in data
    assert "action_plan" in data

def test_analyze_problem_empty_payload():
    response = client.post("/api/analyze/problem", json={"problem": "", "category": "consumer"})
    assert response.status_code == 400
