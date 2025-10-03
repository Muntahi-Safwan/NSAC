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

# Copy Prisma schema first
COPY schema.prisma .

# Generate Prisma client during build
RUN python -m prisma generate

# Copy application code
COPY . .

# Create downloads directory
RUN mkdir -p /app/downloads

# DATABASE_URL should be set via .env file or environment variables
# No default database URL - use external database (Neon, AWS RDS, etc.)

# Default command (can be overridden in docker-compose)
CMD ["python", "scripts/run_hourly_collection.py", "--sample-rate", "1"]


