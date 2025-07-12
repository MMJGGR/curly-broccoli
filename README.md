# FastAPI + React + Tailwind Starter

This repository contains a basic setup for a FastAPI API service and a React frontend using Tailwind CSS. The project is ready for Docker and includes examples for environment variables, linting, and testing.

## Requirements
- Docker and Docker Compose
- Node.js (if running the frontend locally without Docker)
- Python 3.10+

## Quick Start

1. Copy environment variable samples:
   ```bash
   cp api/.env.example api/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start the services with Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Access the API at `http://localhost:8000` and the frontend at `http://localhost:3000`.
4. When initializing additional PostgreSQL databases (e.g. in CI), set
   `PGDATABASE=postgres` and `PGPASSWORD=<your password>` so tools like `psql`
   can connect without prompting.

## Development

- **API**
  - Install dependencies: `pip install -r api/requirements.txt`
  - Run tests from the repository root with `coverage run -m pytest`
    then check coverage with `coverage report --fail-under=90` to ensure it stays
    above **90%** (CI enforces this)
  - Lint code: `flake8 api`
  - Contract tests live under `frontend/tests/contract` and can be executed with
    `pytest frontend/tests/contract`
- **Frontend**
  - Install dependencies: `npm ci`
  - Start the dev server: `npm run dev`
  - Run unit tests: `npm test -- --coverage` (coverage must remain above 90%)
  - Run end-to-end tests: `npm run e2e`

## Deployment
The Docker setup is designed so you can deploy to services like Heroku or a cloud provider with minimal changes.
