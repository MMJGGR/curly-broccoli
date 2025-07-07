# FastAPI + React + Tailwind Starter

This repository contains a basic setup for a FastAPI backend and a React frontend using Tailwind CSS. The project is ready for Docker and includes examples for environment variables, linting, and testing.

## Requirements
- Docker and Docker Compose
- Node.js (if running the frontend locally without Docker)
- Python 3.10+

## Quick Start

1. Copy environment variable samples:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start the services with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Access the backend at `http://localhost:8000` and the frontend at `http://localhost:3000`.

## Development

- **Backend**
  - Install dependencies: `pip install -r backend/requirements.txt`
  - Run tests: `pytest`
  - Lint code: `flake8 backend`
- **Frontend**
  - Install dependencies: `npm install`
  - Start the dev server: `npm start`
  - Run tests: `npm test`

## Deployment
The Docker setup is designed so you can deploy to services like Heroku or a cloud provider with minimal changes.
