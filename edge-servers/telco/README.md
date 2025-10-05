# NSAC Telco Edge Server

A telecommunications edge server for NSAC alerts with multi-container Docker setup.

## Architecture

The telco edge server consists of three main containers:

1. **Database Container** (`telco_postgres`) - PostgreSQL with TimescaleDB
2. **Data Processor Container** (`telco_data_processor`) - Independent data processing service
3. **Telco Server Container** (`telco_edge_server`) - Main FastAPI application

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# - Database credentials
# - SMS/voice service credentials (Twilio, AWS SNS, etc.)
```

### 2. Start Core Services

```bash
# Start database and telco server
docker-compose up -d telco_postgres telco_edge_server

# Wait for services to be ready
sleep 10

# Run database migrations
docker-compose --profile tools run --rm telco_db_migrate
```

### 3. Test Alert Engine

```bash
# Test alert engine via API
curl -X POST http://localhost:8001/alerts/analyze

# Check server status
curl http://localhost:8001/status
```

### 4. Start Data Processor (Optional)

```bash
# Start data processor container
docker-compose --profile data-processing up -d telco_data_processor
```

## Services

### Core Services (Always Running)

- **Telco Server**: http://localhost:8001
- **Database**: localhost:5433

### Optional Services

- **Prisma Studio**: http://localhost:5556 (start with `docker-compose --profile tools up -d telco_prisma_studio`)
- **Data Processor**: Runs independently when started

## API Endpoints

- `GET /health` - Health check
- `GET /status` - Service status
- `POST /alerts/analyze` - **Run alert engine analysis**
- `POST /alert` - Process and deliver alerts
- `GET /alerts/recent` - Get recent alerts
- `POST /test/sms` - Test SMS delivery
- `POST /test/voice` - Test voice call delivery

## Management

```bash
# View logs
docker-compose logs -f telco_edge_server

# Check status
docker-compose ps

# Stop all services
docker-compose down

# Stop with profiles
docker-compose --profile tools --profile data-processing down
```

## Configuration

Key environment variables in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - **Google Gemini AI API key for alert generation**
- `COVERAGE_AREA_*` - **Geographic bounds for hazard analysis**
- `TWILIO_*` - Twilio SMS/voice configuration
- `AWS_*` - AWS SNS configuration
- `FIREBASE_*` - Firebase push notifications
- `TELCO_SERVER_PORT` - Server port (default: 8000)

## Data Processor

The data processor is an independent container that can be:

- Started separately when needed
- Stopped without affecting the telco server
- Shared across multiple edge servers
- Updated independently

## Development

```bash
# Open shell in telco server
docker-compose exec telco_edge_server /bin/bash

# Open shell in data processor
docker-compose exec telco_data_processor /bin/bash

# Run tests
curl http://localhost:8001/health
```
