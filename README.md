# FastAPI + React + Tailwind Starter

This repository contains a basic setup for a FastAPI API service and a React frontend using Tailwind CSS. The project is ready for Docker and includes examples for environment variables, linting, and testing.

## Requirements
- Docker and Docker Compose
- Node.js (if running the frontend locally without Docker)
- Python 3.10+

## Quick Start

1. Copy environment variable samples:
   ```bash
   cp .env.example .env
   cp api/.env.example api/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start the services with Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Access the API at `http://localhost:8000` and the frontend at `http://localhost:3000`.
   The Create React App dev server is configured to proxy `/auth` and other
   API paths to the FastAPI backend running on port `8000`, so API calls from
   the frontend during development will work out of the box.

## Development

- **API**
  - Install dependencies: `pip install -r api/requirements.txt` (includes `httpx` for HTTP requests)
  - Run tests from the repository root with `pytest --cov-report=xml`
    (coverage settings are in `pytest.ini`) and ensure coverage stays above **90%** (CI enforces this)
  - Lint code: `flake8 api`
- **Frontend**
  - Install dependencies: `npm install`
  - Start the dev servers (API and frontend): `npm run dev`
  - Run tests: `npm test -- --coverage` (coverage must remain above 90%)

## Deployment
The Docker setup is designed so you can deploy to services like Heroku or a cloud provider with minimal changes.

## API Tips

The `/auth/register` endpoint accepts the `questionnaire` field as either a list
of integers or a dictionary mapping question numbers to answers. Responses are
normalized automatically and the computed risk score and risk level are returned
in the registration response.
