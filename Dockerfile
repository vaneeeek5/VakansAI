FROM python:3.11-slim

WORKDIR /app

# Install dependencies first for caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code directly to /app
COPY backend/ .
COPY .env .

# Ensure app is found by Python
ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
