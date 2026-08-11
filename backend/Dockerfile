# Multi-stage Dockerfile for FastAPI Backend Deployment on Render

# --- Stage 1: Build & Dependencies ---
FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Production Runtime ---
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/install/bin:$PATH" \
    PYTHONPATH="/install/lib/python3.11/site-packages:/app" \
    PORT=10000

COPY --from=builder /install /install
COPY . /app

# Run as a non-root user for hardening.
RUN groupadd -r appuser && useradd -r -g appuser -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000", "--proxy-headers", "--forwarded-allow-ips=*"]
