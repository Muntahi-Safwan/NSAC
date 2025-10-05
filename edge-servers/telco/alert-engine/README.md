# Alert Engine

The Alert Engine analyzes environmental hazards and generates personalized alerts for vulnerable individuals and general population alerts.

## Features

- **Vulnerable Individual Alerts**: Analyzes users based on age, diseases, and allergies
- **General Population Alerts**: Broadcasts alerts for critical hazards
- **Gemini AI Integration**: Generates contextual, personalized messages
- **Multi-Hazard Support**: Air quality, wildfires, and heatwaves
- **Coverage Area Filtering**: Only processes hazards within configured geographic bounds

## Configuration

Set these environment variables in `.env`:

```bash
# Coverage Area
COVERAGE_AREA_NORTH=60.0
COVERAGE_AREA_SOUTH=15.0
COVERAGE_AREA_EAST=-60.0
COVERAGE_AREA_WEST=-130.0

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Alert Settings
MAX_SMS_LENGTH=160
```

## Usage

### Run Alert Analysis

```bash
# Via API endpoint
curl -X POST http://localhost:8001/alerts/analyze

# Direct script execution
python alert-engine/test_alert_engine.py
```

### Alert Types

1. **Vulnerable Individual Alerts**:

   - Users with respiratory conditions (asthma, COPD, etc.)
   - Children under 12 or adults over 65
   - Users with allergies
   - Personalized messages based on health profile

2. **General Population Alerts**:
   - Critical air quality (AQI > 200)
   - High-level wildfire alerts (Level 2+)
   - Broadcast to all users in affected area

## Output

The alert engine displays:

- Phone numbers of users to alert
- Personalized messages for vulnerable individuals
- General alert messages for population
- Hazard details and locations

## Database Tables Used

- `users` - User profiles with health information
- `airqualityforecast` - Air quality predictions with AQI
- `firedetections` - Wildfire detections with alert levels
