# File: api/Dockerfile
FROM python:3.10-slim

# 1) Set working dir
WORKDIR /app

# 2) Install dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3) Copy your entire repo (api/, compute/, alembic/, etc)
COPY . .

# Remove lightweight Pydantic stub so the real library installed above is used
RUN rm -rf /app/pydantic /app/fastapi

# 4) Tell Python where to find both app/ and compute/
ENV PYTHONPATH=/app:/app/api

# 5) Launch Uvicorn against your FastAPI app
CMD ["uvicorn", "api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
