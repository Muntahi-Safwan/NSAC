FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for telco server
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy alert-engine module
COPY alert-engine/ ./alert-engine/

# Install Google Generative AI for alert engine
RUN pip install --no-cache-dir google-generativeai>=0.3.0

# Create logs directory
RUN mkdir -p /app/logs

# Set up Prisma
RUN python -m prisma generate

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command
CMD ["python", "main.py"]

