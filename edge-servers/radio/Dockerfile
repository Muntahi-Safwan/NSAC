FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libhdf5-dev \
    libnetcdf-dev \
    pkg-config \
    alsa-utils \
    sox \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create downloads and audio directories
RUN mkdir -p /app/downloads /app/audio

# Expose port
EXPOSE 8000

# Default command
CMD ["python", "simple_main.py"]

