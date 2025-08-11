# File: api/Dockerfile
# Stage 1: Builder
FROM python:3.10-slim as builder

WORKDIR /app

# Install dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install sqlalchemy alembic

# Copy necessary files from the project root
COPY compute/ ./compute
COPY alembic/ ./alembic
COPY alembic.ini .
COPY wait-for-it.sh .
RUN chmod +x /app/wait-for-it.sh

# Copy the api directory
COPY api/ ./api

# Stage 2: Final Image
FROM python:3.10-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.10/site-packages/ /usr/local/lib/python3.10/site-packages/

# Copy application code from builder
COPY --from=builder /app/ /app/

# Tell Python where to find both app/ and compute/
ENV PYTHONPATH=/app:/app/api

# Launch Uvicorn against your FastAPI app
CMD ["uvicorn", "api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]