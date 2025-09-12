
import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU3NjcyNTA4Ljg1OTQ1NywiZXhwIjoxNzg5MjA4NTA4Ljg1OTQ1Nywic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.5sEgt0awhyq1OxljAvCGnZl2ckz7RErPxbgrMODkpEE"

url = "http://localhost:8000/api/v1/onboarding/fix-profile-data?force_overwrite=True"

headers = {
    "Authorization": f"Bearer {token}"
}

response = requests.post(url, headers=headers)

if response.status_code == 200:
    print(response.json())
else:
    print(f"Error: {response.status_code}")
    print(response.text)
