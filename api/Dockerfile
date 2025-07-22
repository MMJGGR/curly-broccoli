# File: api/Dockerfile
FROM python:3.10-slim

# 1) Set working dir
WORKDIR /app

# 2) Install dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt     && pip install --no-cache-dir sqlalchemy alembic     && apt-get update && apt-get install -y netcat-traditional iputils-ping

# 3) Copy your entire repo (api/, compute/, alembic/, etc)
COPY . .
COPY alembic.ini .
COPY alembic ./alembic
COPY wait-for-it.sh /app/
COPY api/app/tests /app/app/tests
RUN chmod +x /app/wait-for-it.sh

# Remove lightweight Pydantic stub so the real library installed above is used
RUN rm -rf /app/pydantic /app/fastapi /app/sqlalchemy

# 4) Tell Python where to find both app/ and compute/
ENV PYTHONPATH=/app:/app/api

# 5) Launch Uvicorn against your FastAPI app
CMD ["uvicorn", "api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
