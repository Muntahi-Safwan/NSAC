# Dockerfile for Air Quality Data Processing Pipeline
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for netCDF4
RUN apt-get update && apt-get install -y \
    libhdf5-dev \
    libnetcdf-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Generate Prisma client during build
RUN python -m prisma generate

# Create downloads directory
RUN mkdir -p /app/downloads

# Set environment variable for Prisma
ENV DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/airquality?schema=public"

# Run the pipeline
CMD ["python", "main.py"]


