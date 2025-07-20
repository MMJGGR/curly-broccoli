import requests
import json

url = "http://localhost:8000/auth/register"
headers = {"Content-Type": "application/json"}
payload = {
    "email": "testuser_final5@example.com", # Change email for new registration
    "password": "testpassword",
    "dob": "1990-01-01",
    "kra_pin": "A123456794Z",
    "annual_income": 500000,
    "dependents": 2,
    "goals": {},
    "questionnaire": [1, 2, 3, 4, 5],
    "role": "advisor" # Change to "advisor" to register an advisor user
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
    print(response.json())
except requests.exceptions.RequestException as e:   
    print(f"Error during API call: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response status code: {e.response.status_code}")
        print(f"Response content: {e.response.text}")
    else:
        print("No response object found.")