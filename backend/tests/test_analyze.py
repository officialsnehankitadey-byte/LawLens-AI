from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_problem_endpoint():
    payload = {
        "problem": "Purchased an electronic item that stopped working within 3 days.",
        "category": "auto",
        "location": "Delhi"
    }
    response = client.post("/api/analyze/problem", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "situation_summary" in data
    assert "detected_issue" in data
    assert "applicable_rights_or_schemes" in data
    assert "action_plan" in data
    assert "suggested_lawyers" in data
    assert len(data["suggested_lawyers"]) == 5
    assert "predicted_category" in data

def test_analyze_criminal_auto_category_and_lawyers():
    payload = {
        "problem": "A suspect was arrested by police without FIR or arrest memo in a robbery allegation",
        "location": "Delhi"
    }
    response = client.post("/api/analyze/problem", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_category"] == "criminal"
    assert len(data["suggested_lawyers"]) == 5
    assert any("Delhi" in l["location"] for l in data["suggested_lawyers"])

def test_suggest_lawyers_endpoint():
    response = client.get("/api/lawyers/suggest?category=criminal&location=Delhi&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "lawyers" in data
    assert len(data["lawyers"]) == 5
    assert data["lawyers"][0]["verified_practitioner"] is True

def test_analyze_problem_empty_payload():
    response = client.post("/api/analyze/problem", json={"problem": "", "category": "consumer"})
    assert response.status_code == 400
