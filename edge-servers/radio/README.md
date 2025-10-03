# Radio Edge Server

This directory contains an independent radio edge server implementation with AI-powered environmental analysis and audio insights generation.

## Overview

The Radio Edge Server is designed to:

- **Analyze environmental data** (air quality, wildfires) using AI
- **Generate radio insights** with Google Gemini AI
- **Create audio content** for radio broadcasting
- **Schedule analysis** hourly and daily
- **Provide independent operation** with its own database and data processing

## Features

### AI-Powered Analysis

- **Data Analysis**: Analyzes air quality and wildfire data
- **Gemini AI Integration**: Uses Google Gemini for intelligent insights
- **Audio Generation**: Creates radio-ready audio content
- **Risk Assessment**: Calculates environmental risk levels

### Broadcasting

- **AM/FM Broadcasting**: Support for multiple radio frequencies
- **Audio Processing**: Text-to-speech conversion for alerts
- **EAS Compliance**: Emergency Alert System integration
- **FCC Compliance**: Meets Federal Communications Commission requirements

### Independent Operation

- **Own Database**: Independent PostgreSQL with environmental data
- **Own Data Processing**: Complete air quality and wildfire monitoring
- **Own Scheduler**: Automated hourly and daily analysis
- **No External Dependencies**: Runs standalone

## Architecture

### Analysis Pipeline

```
Environmental Data → Data Analyzer → Gemini AI → Audio Generator → Radio Broadcast
```

### Components

1. **Data Analyzer** (`services/data_analyzer.py`)

   - Analyzes air quality and wildfire data
   - Calculates risk levels and trends
   - Generates environmental insights

2. **Gemini Analyzer** (`services/gemini_analyzer.py`)

   - Uses Google Gemini AI for intelligent analysis
   - Generates radio-friendly scripts and headlines
   - Provides safety advice and recommendations

3. **Audio Generator** (`services/audio_generator.py`)

   - Converts text insights to audio
   - Supports multiple TTS engines
   - Generates broadcast-ready audio files

4. **Radio Scheduler** (`services/radio_scheduler.py`)
   - Manages hourly and daily analysis schedules
   - Coordinates the complete analysis pipeline
   - Tracks analysis history and results

### Database Schema

The radio server uses two database schemas:

- **Environmental Data**: Air quality, wildfire, and meteorological data
- **Radio Alerts**: Alert delivery, broadcast logs, and audio files

## Deployment

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database
- Google Gemini API key
- Radio broadcasting equipment (for production)

### Setup

1. **Copy environment file**:

   ```bash
   cp env.example .env
   ```

2. **Configure settings**:

   - Set `GEMINI_API_KEY` for AI analysis
   - Update database connection settings
   - Configure radio frequencies and power settings
   - Set FCC compliance parameters

3. **Deploy services**:
   ```bash
   python manage_services.py build
   python manage_services.py start
   ```

### Configuration

Key environment variables:

- `GEMINI_API_KEY`: Google Gemini API key for AI analysis
- `RADIO_SERVER_PORT`: API server port (default: 8000)
- `AM_FREQUENCY`: AM frequency for broadcasting
- `FM_FREQUENCY`: FM frequency for broadcasting
- `TRANSMIT_POWER`: Transmission power in watts
- `FCC_LICENSE_NUMBER`: FCC license number
- `EAS_ENABLED`: Enable Emergency Alert System

## API Endpoints

### Health and Status

- `GET /health` - Health check
- `GET /status` - Service status

### Analysis System

- `GET /analysis/status` - Analysis system status
- `GET /analysis/insights` - Latest radio insights
- `GET /analysis/history` - Analysis history
- `POST /analysis/run` - Run manual analysis
- `POST /analysis/test` - Test analysis system

### Alert Processing

- `POST /alert` - Process and broadcast alert
- `GET /alerts/recent` - Get recent alerts

### Testing

- `POST /test/broadcast` - Test radio broadcast
- `POST /test/audio` - Test audio generation

## Usage

### Getting Radio Insights

```bash
# Get latest insights
curl "http://localhost:8002/analysis/insights"

# Get analysis status
curl "http://localhost:8002/analysis/status"

# Run manual analysis
curl -X POST "http://localhost:8002/analysis/run?analysis_type=hourly"
```

### Processing Alerts

```bash
curl -X POST "http://localhost:8002/alert" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "wildfire",
    "priority": "high",
    "title": "Wildfire Alert",
    "message": "Wildfire detected in your area",
    "location": "North America",
    "broadcast_frequencies": ["AM", "FM"],
    "repeat_count": 3,
    "tone_alert": true
  }'
```

### Testing Analysis System

```bash
# Test complete system
curl -X POST "http://localhost:8002/analysis/test"

# Test audio generation
curl -X POST "http://localhost:8002/test/audio" \
  -d "text=This is a test of the audio generation system"
```

## Analysis Schedule

### Automatic Analysis

- **Hourly Analysis**: Runs every hour on the hour
- **Daily Analysis**: Runs daily at midnight
- **Initial Analysis**: Runs immediately on startup

### Manual Analysis

- **Hourly**: `POST /analysis/run?analysis_type=hourly`
- **Daily**: `POST /analysis/run?analysis_type=daily`

## Monitoring

### Service Management

```bash
# View status
python manage_services.py status

# View logs
python manage_services.py logs --follow

# Restart services
python manage_services.py restart
```

### Analysis Monitoring

```bash
# Check analysis status
curl "http://localhost:8002/analysis/status"

# View analysis history
curl "http://localhost:8002/analysis/history?limit=50"

# Get latest insights
curl "http://localhost:8002/analysis/insights"
```

### Database Access

Access the database via Prisma Studio:

```bash
python manage_services.py start --service radio_prisma_studio
# Open http://localhost:5557
```

## AI Configuration

### Gemini AI Setup

1. **Get API Key**: Obtain from Google AI Studio
2. **Set Environment**: Add to `.env` file
3. **Test Integration**: Use `/analysis/test` endpoint

### Audio Generation

The system supports multiple TTS engines:

- **pyttsx3**: Offline TTS (default)
- **gTTS**: Google Text-to-Speech
- **Fallback**: Text file generation

## Compliance

### FCC Requirements

- **License**: Valid FCC license required
- **Power Limits**: Transmission power within legal limits
- **Frequency**: Licensed frequency usage
- **EAS**: Emergency Alert System compliance

### EAS Integration

- **Event Codes**: Standard EAS event codes
- **Duration**: Configurable alert duration
- **Tones**: Emergency alert tones
- **Testing**: Regular EAS testing capability

## Troubleshooting

### Common Issues

1. **No AI Analysis**:

   - Check `GEMINI_API_KEY` configuration
   - Verify internet connectivity
   - Check API quota and limits

2. **No Audio Output**:

   - Check audio device configuration
   - Verify TTS engine initialization
   - Check audio file permissions

3. **Analysis Failures**:
   - Check database connectivity
   - Verify data processing services
   - Review analysis logs

### Logs

View detailed logs:

```bash
# Service logs
python manage_services.py logs

# Analysis logs
python manage_services.py logs --service radio-scheduler

# Application logs
tail -f logs/radio_edge_server_*.log
```

## Development

### Local Development

1. **Clone and setup**:

   ```bash
   cd edge-servers/radio
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows

   pip install -r requirements.txt
   ```

2. **Run locally**:
   ```bash
   python main.py
   ```

### Testing

```bash
# Test analysis system
curl -X POST "http://localhost:8002/analysis/test"

# Test individual components
python -m pytest tests/
```

## Support

For issues and questions:

- Check the logs for error messages
- Verify configuration settings
- Test individual components
- Contact system administrator
