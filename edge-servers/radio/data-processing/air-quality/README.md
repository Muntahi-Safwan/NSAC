# AQI (Air Quality Index) Calculator

EPA-compliant Air Quality Index calculation for multiple pollutants.

## Overview

This module calculates the EPA Air Quality Index (AQI) for:

- PM2.5 (Particulate Matter < 2.5μm)
- PM10 (Particulate Matter < 10μm)
- O3 (Ozone)
- CO (Carbon Monoxide)
- SO2 (Sulfur Dioxide)
- NO2 (Nitrogen Dioxide)

## Files

- `__init__.py` - Package initialization
- `breakpoints.py` - EPA AQI breakpoint tables and categories
- `calculator.py` - AQI calculation logic
- `README.md` - This file

## Usage

```python
from aqi import AQICalculator

# Calculate individual pollutant AQI
pm25_aqi = AQICalculator.calculate_pm25_aqi(35.5)  # μg/m³
print(f"PM2.5 AQI: {pm25_aqi}")  # Output: 101

# Calculate for all pollutants
pollutants = {
    'pm25': 35.5,  # μg/m³
    'no2': 50.0,   # μg/m³
    'o3': 80.0,    # μg/m³
    'so2': 40.0,   # μg/m³
    'co': 5000.0,  # μg/m³
}

aqi_values = AQICalculator.calculate_all_aqi(pollutants)
print(f"All AQI values: {aqi_values}")

# Get overall AQI (highest)
overall_aqi, dominant_pollutant = AQICalculator.get_overall_aqi(aqi_values)
print(f"Overall AQI: {overall_aqi} (limited by {dominant_pollutant})")

# Get category and color
category = AQICalculator.get_aqi_category(overall_aqi)
color = AQICalculator.get_aqi_color(overall_aqi)
description = AQICalculator.get_aqi_description(overall_aqi)

print(f"Category: {category}")
print(f"Color: {color}")
print(f"Description: {description}")
```

## AQI Categories

| AQI Range | Category                       | Color            | Health Impact             |
| --------- | ------------------------------ | ---------------- | ------------------------- |
| 0-50      | Good                           | Green (#00E400)  | Satisfactory              |
| 51-100    | Moderate                       | Yellow (#FFFF00) | Acceptable                |
| 101-150   | Unhealthy for Sensitive Groups | Orange (#FF7E00) | Sensitive groups affected |
| 151-200   | Unhealthy                      | Red (#FF0000)    | Everyone may be affected  |
| 201-300   | Very Unhealthy                 | Purple (#8F3F97) | Health alert              |
| 301-500   | Hazardous                      | Maroon (#7E0023) | Emergency conditions      |

## Unit Conversions

The calculator automatically handles unit conversions:

- **Input**: All concentrations in μg/m³ (from database)
- **Internal**: Converts to EPA-required units:
  - PM2.5, PM10: μg/m³ (no conversion needed)
  - O3: ppm (converted from μg/m³)
  - CO: ppm (converted from μg/m³)
  - SO2: ppb (converted from μg/m³)
  - NO2: ppb (converted from μg/m³)

## EPA AQI Formula

```
AQI = [(I_high - I_low) / (C_high - C_low)] × (C - C_low) + I_low

Where:
- I_high, I_low: AQI breakpoint values
- C_high, C_low: Concentration breakpoint values
- C: Measured concentration
```

## References

- [EPA AQI Basics](https://www.airnow.gov/aqi/aqi-basics/)
- [AQI Calculator](https://www.airnow.gov/aqi/aqi-calculator-concentration/)
- [Technical Assistance Document](https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf)

## Notes

- O3 uses 8-hour averaging by default
- 1-hour O3 only applies when concentration >= 0.125 ppm
- Overall AQI is the maximum of all pollutant sub-indices
- Missing pollutants are simply not included in the calculation


