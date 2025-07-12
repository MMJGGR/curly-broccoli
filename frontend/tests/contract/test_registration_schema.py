import jsonschema
from app.schemas import RegisterRequest
from app.main import app


def test_register_schema_consistent_with_openapi():
    openapi = app.openapi()["components"]["schemas"]["RegisterRequest"]
    model_schema = RegisterRequest.model_json_schema()
    assert set(model_schema["properties"].keys()) == set(openapi["properties"].keys())


def test_sample_payload_validates_against_schema():
    payload = {
        "email": "user@example.com",
        "password": "strongpassword",
        "full_name": "User Example",
        "date_of_birth": "1990-01-01",
        "id_type": "ID",
        "id_number": "123",
        "kra_pin": "A",
        "marital_status": "Single",
        "employment_status": "Employed",
        "monthly_income_kes": 100.0,
        "net_worth_estimate": 1000.0,
        "risk_tolerance_score": 5,
        "retirement_age_goal": 65,
        "investment_goals": "growth",
    }
    schema = RegisterRequest.model_json_schema()
    jsonschema.validate(payload, schema)
    RegisterRequest(**payload)
