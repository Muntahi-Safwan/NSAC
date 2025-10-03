# NSAC Edge Servers

Independent edge servers for telecommunications, radio, and television alert delivery.

## Overview

The NSAC Edge Servers are designed to operate independently at telecommunications companies, radio stations, and television stations. Each server has its own database and **independent data processing capabilities**.

## Architecture

### Independent Operation

Each edge server is completely independent with:

- **Own Database**: PostgreSQL with dedicated schema
- **Own Data Processing**: Complete copy of air quality and wildfire systems
- **Own Scheduler**: Hourly data collection and alert processing
- **Own API**: FastAPI application for alert delivery

### Telco Edge Server

- **Port**: 8001 (API), 5433 (Database), 5556 (Prisma Studio)
- **Database**: `telco_alerts`
- **Features**: SMS, voice calls, mobile push notifications
- **Data Processing**: Independent air quality and wildfire monitoring
- **Scheduler**: `telco-scheduler` service

### Radio Edge Server

- **Port**: 8002 (API), 5434 (Database), 5557 (Prisma Studio)
- **Database**: `radio_alerts`
- **Features**: AM/FM broadcasting, audio processing, EAS compliance
- **Data Processing**: Independent air quality and wildfire monitoring
- **Scheduler**: `radio-scheduler` service

### TV Edge Server

- **Port**: 8003 (API), 5435 (Database), 5558 (Prisma Studio)
- **Database**: `tv_alerts`
- **Features**: Cable/satellite broadcasting, video overlays, crawler text
- **Data Processing**: Independent air quality and wildfire monitoring
- **Scheduler**: `tv-scheduler` service

## Independent Data Processing

Each edge server includes a complete copy of:

- **Air Quality System**: Real-time and forecast data collection
- **Wildfire Detection**: NASA FIRMS API integration
- **Database Schemas**: Prisma models for all data types
- **Hourly Scheduler**: Automated data collection every hour
- **Alert Processing**: Local alert generation and delivery

## Deployment

Each edge server can be deployed independently:

```bash
# Deploy telco server
cd edge-servers/telco
python manage_services.py build
python manage_services.py start

# Deploy radio server
cd edge-servers/radio
python manage_services.py build
python manage_services.py start

# Deploy TV server
cd edge-servers/tv
python manage_services.py build
python manage_services.py start
```

## Service Management

Each edge server includes a management script:

```bash
# Build services
python manage_services.py build

# Start all services
python manage_services.py start

# Start specific service
python manage_services.py start --service telco-edge-server

# Stop services
python manage_services.py stop

# View status
python manage_services.py status

# View logs
python manage_services.py logs
python manage_services.py logs --service telco-scheduler --follow

# Cleanup
python manage_services.py cleanup
```

## Configuration

Each edge server requires:

1. **Environment File**: Copy `env.example` to `.env` and configure
2. **API Keys**: NASA FIRMS API key for wildfire detection
3. **Database**: PostgreSQL connection settings
4. **Service Settings**: Ports, frequencies, channels, etc.

## Geographic Deployment

Edge servers are designed for geographic distribution:

- **Telco Stations**: Deploy at telecommunications facilities
- **Radio Stations**: Deploy at radio broadcast facilities
- **TV Stations**: Deploy at television broadcast facilities

Each server operates independently with local data processing and alert delivery.

## Benefits

- **Complete Independence**: No external dependencies
- **Local Data Processing**: Real-time monitoring at the edge
- **Resilience**: Individual server failures don't affect others
- **Scalability**: Deploy additional servers as needed
- **Geographic Coverage**: Distribute servers for maximum coverage
