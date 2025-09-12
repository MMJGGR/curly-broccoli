
import requests

username = "admin@example.com"
password = "admin"

url = "http://localhost:8000/auth/login"

data = {
    "username": username,
    "password": password
}

response = requests.post(url, data=data)

if response.status_code == 200:
    print(response.json()["access_token"])
else:
    print(f"Error: {response.status_code}")
    print(response.text)
