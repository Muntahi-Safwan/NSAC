"""
EPA AQI Breakpoints for Pollutants

Reference: https://www.airnow.gov/aqi/aqi-calculator-concentration/
Last Updated: 2024 EPA Standards
"""

# AQI Categories and their color codes
AQI_CATEGORIES = {
    'Good': {
        'range': (0, 50),
        'color': '#00E400',
        'description': 'Air quality is satisfactory, and air pollution poses little or no risk.'
    },
    'Moderate': {
        'range': (51, 100),
        'color': '#FFFF00',
        'description': 'Air quality is acceptable. However, there may be a risk for some people.'
    },
    'Unhealthy for Sensitive Groups': {
        'range': (101, 150),
        'color': '#FF7E00',
        'description': 'Members of sensitive groups may experience health effects.'
    },
    'Unhealthy': {
        'range': (151, 200),
        'color': '#FF0000',
        'description': 'Some members of the general public may experience health effects.'
    },
    'Very Unhealthy': {
        'range': (201, 300),
        'color': '#8F3F97',
        'description': 'Health alert: The risk of health effects is increased for everyone.'
    },
    'Hazardous': {
        'range': (301, 500),
        'color': '#7E0023',
        'description': 'Health warning of emergency conditions: everyone is more likely to be affected.'
    }
}

# EPA AQI Breakpoints
# Format: [(C_low, C_high, AQI_low, AQI_high), ...]

# PM2.5 (24-hour average, μg/m³)
PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 500.4, 301, 500),
]

# PM10 (24-hour average, μg/m³)
PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 604, 301, 500),
]

# O3 (8-hour average, ppm)
O3_8HR_BREAKPOINTS = [
    (0.000, 0.054, 0, 50),
    (0.055, 0.070, 51, 100),
    (0.071, 0.085, 101, 150),
    (0.086, 0.105, 151, 200),
    (0.106, 0.200, 201, 300),
]

# O3 (1-hour average, ppm) - only for values >= 0.125
O3_1HR_BREAKPOINTS = [
    (0.125, 0.164, 101, 150),
    (0.165, 0.204, 151, 200),
    (0.205, 0.404, 201, 300),
    (0.405, 0.604, 301, 500),
]

# CO (8-hour average, ppm)
CO_BREAKPOINTS = [
    (0.0, 4.4, 0, 50),
    (4.5, 9.4, 51, 100),
    (9.5, 12.4, 101, 150),
    (12.5, 15.4, 151, 200),
    (15.5, 30.4, 201, 300),
    (30.5, 50.4, 301, 500),
]

# SO2 (1-hour average, ppb)
SO2_BREAKPOINTS = [
    (0, 35, 0, 50),
    (36, 75, 51, 100),
    (76, 185, 101, 150),
    (186, 304, 151, 200),
    (305, 604, 201, 300),
    (605, 1004, 301, 500),
]

# NO2 (1-hour average, ppb)
NO2_BREAKPOINTS = [
    (0, 53, 0, 50),
    (54, 100, 51, 100),
    (101, 360, 101, 150),
    (361, 649, 151, 200),
    (650, 1249, 201, 300),
    (1250, 2049, 301, 500),
]

# Collection of all breakpoints
AQI_BREAKPOINTS = {
    'pm25': PM25_BREAKPOINTS,
    'pm10': PM10_BREAKPOINTS,
    'o3_8hr': O3_8HR_BREAKPOINTS,
    'o3_1hr': O3_1HR_BREAKPOINTS,
    'co': CO_BREAKPOINTS,
    'so2': SO2_BREAKPOINTS,
    'no2': NO2_BREAKPOINTS,
}

# Unit conversion factors for display
UNIT_CONVERSIONS = {
    'pm25': {'unit': 'μg/m³', 'factor': 1.0},
    'pm10': {'unit': 'μg/m³', 'factor': 1.0},
    'o3': {'unit': 'ppm', 'factor': 1.0},  # Need to convert from μg/m³
    'co': {'unit': 'ppm', 'factor': 1.0},  # Need to convert from μg/m³
    'so2': {'unit': 'ppb', 'factor': 1.0},  # Need to convert from μg/m³
    'no2': {'unit': 'ppb', 'factor': 1.0},  # Need to convert from μg/m³
}


