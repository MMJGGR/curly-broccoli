import requests
import json

url = "http://localhost:8000/auth/login"
headers = {"Content-Type": "application/x-www-form-urlencoded"}

# Use the same email and password you used for registration
payload = {
    "username": "testuser@example.com",
    "password": "testpassword"
}

try:
    response = requests.post(url, headers=headers, data=payload)
    response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"Error during API call: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response status code: {e.response.status_code}")
        print(f"Response content: {e.response.text}")
    else:
        print("No response object found.")
