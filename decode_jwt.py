import jwt
import os

# Replace with the access token you just obtained
token = "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAiMiIsICJpYXQiOiAxNzUzMDIzOTQ4LjgwMDc4OCwgImV4cCI6IDE3NTMwMjQ4NDguODAwNzg4LCAic2NvcGUiOiAidXNlciIsICJyb2xlIjogInVzZXIifQ.F0mlYdmqWa6bpmFm9IR16MzVj8G1caH3wEXqA5euWgw"

# Replace with your SECRET_KEY from api/app/core/config.py or .env
# For development, it's often "secret"
SECRET_KEY = "secret"
ALGORITHM = "HS256"

try:
    decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("Decoded JWT Payload:")
    print(decoded_payload)
except jwt.ExpiredSignatureError:
    print("Token has expired!")
except jwt.InvalidTokenError:
    print("Invalid token!")
except Exception as e:
    print(f"An error occurred while decoding the token: {e}")
