# File: api/Dockerfile
FROM python:3.10-slim

# 1) Set working dir
WORKDIR /app

# 2) Install dependencies (use pip cache for faster rebuilds)
COPY api/requirements.txt .
RUN pip install -r requirements.txt \
    && pip install sqlalchemy alembic \
    && apt-get update && apt-get install -y netcat-traditional iputils-ping \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3) Copy your entire repo (api/, compute/, alembic/, etc)
COPY api/ ./api
COPY compute/ ./compute
COPY alembic/ ./alembic
COPY alembic.ini .
COPY wait-for-it.sh /app/
RUN chmod +x /app/wait-for-it.sh

# Remove lightweight Pydantic stub so the real library installed above is used
RUN rm -rf /app/pydantic /app/fastapi /app/sqlalchemy

# 4) Tell Python where to find both app/ and compute/
ENV PYTHONPATH=/app:/app/api

# 5) Launch Uvicorn against your FastAPI app
CMD ["uvicorn", "api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
