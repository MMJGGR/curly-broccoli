import requests
import json

url = "http://localhost:8000/auth/register"
headers = {"Content-Type": "application/json"}
data = {
    "email": "test_account_creation@example.com", # Use a new email to test successful registration
    "password": "password123",
    "dob": "1990-01-01",
    "kra_pin": "A123456789Z",
    "annual_income": 50000.0,
    "dependents": 0,
    "goals": {"timeHorizon": 5},
    "questionnaire": [3, 3, 3, 3, 3, 3, 3, 3],
    "role": "user"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except requests.exceptions.ConnectionError as e:
    print(f"Connection Error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")