/**
 * EPA AQI Calculator
 *
 * Calculates Air Quality Index (AQI) values for individual pollutants
 * and determines overall AQI based on EPA methodology.
 *
 * Reference: https://www.airnow.gov/aqi/aqi-basics/
 */

const { AQI_BREAKPOINTS, AQI_CATEGORIES } = require('./breakpoints');

class AQICalculator {
  // Molecular weights for unit conversions
  static MW = {
    o3: 48.0, // Ozone
    no2: 46.0, // Nitrogen Dioxide
    so2: 64.0, // Sulfur Dioxide
    co: 28.0, // Carbon Monoxide
  };

  /**
   * Calculate AQI using EPA's piecewise linear function
   *
   * AQI = [(I_high - I_low) / (C_high - C_low)] × (C - C_low) + I_low
   *
   * @param {number} concentration - Pollutant concentration
   * @param {Array} breakpoints - Array of [C_low, C_high, AQI_low, AQI_high]
   * @returns {number} AQI value (0-500)
   */
  static calculateAQI(concentration, breakpoints) {
    if (concentration < 0) {
      return 0;
    }

    // Find the appropriate breakpoint range
    for (const [cLow, cHigh, aqiLow, aqiHigh] of breakpoints) {
      if (concentration >= cLow && concentration <= cHigh) {
        // Linear interpolation
        const aqi = ((aqiHigh - aqiLow) / (cHigh - cLow)) * (concentration - cLow) + aqiLow;
        return Math.round(aqi);
      }
    }

    // If concentration exceeds all breakpoints, cap at 500
    if (concentration > breakpoints[breakpoints.length - 1][1]) {
      return 500;
    }

    return 0;
  }

  /**
   * Convert μg/m³ to ppm
   *
   * Formula: ppm = (μg/m³ × 24.45) / MW
   * At 25°C and 1 atm: molar volume ≈ 24.45 L/mol
   *
   * @param {number} ugM3 - Concentration in μg/m³
   * @param {number} molecularWeight - Molecular weight in g/mol
   * @param {number} tempK - Temperature in Kelvin (default 25°C = 298.15K)
   * @param {number} pressureAtm - Pressure in atmospheres (default 1.0)
   * @returns {number} Concentration in ppm
   */
  static ugM3ToPpm(ugM3, molecularWeight, tempK = 298.15, pressureAtm = 1.0) {
    // Ideal gas constant
    const R = 0.08206; // L·atm/(mol·K)

    // Molar volume at given temp and pressure
    const molarVolume = (R * tempK) / pressureAtm; // L/mol

    // Convert μg/m³ to mg/m³ to mg/L to ppm
    const mgM3 = ugM3 / 1000; // μg to mg
    const mgL = mgM3 / 1000; // m³ to L
    const ppm = (mgL * molarVolume) / molecularWeight;

    return ppm;
  }

  /**
   * Convert μg/m³ to ppb
   *
   * @param {number} ugM3 - Concentration in μg/m³
   * @param {number} molecularWeight - Molecular weight in g/mol
   * @param {number} tempK - Temperature in Kelvin (default 25°C = 298.15K)
   * @param {number} pressureAtm - Pressure in atmospheres (default 1.0)
   * @returns {number} Concentration in ppb
   */
  static ugM3ToPpb(ugM3, molecularWeight, tempK = 298.15, pressureAtm = 1.0) {
    const ppm = this.ugM3ToPpm(ugM3, molecularWeight, tempK, pressureAtm);
    return ppm * 1000; // ppm to ppb
  }

  /**
   * Calculate AQI for PM2.5 (μg/m³)
   * @param {number} pm25UgM3 - PM2.5 concentration
   * @returns {number} AQI value
   */
  static calculatePM25AQI(pm25UgM3) {
    return this.calculateAQI(pm25UgM3, AQI_BREAKPOINTS.pm25);
  }

  /**
   * Calculate AQI for PM10 (μg/m³)
   * @param {number} pm10UgM3 - PM10 concentration
   * @returns {number} AQI value
   */
  static calculatePM10AQI(pm10UgM3) {
    return this.calculateAQI(pm10UgM3, AQI_BREAKPOINTS.pm10);
  }

  /**
   * Calculate AQI for O3
   *
   * @param {number} o3UgM3 - O3 concentration in μg/m³
   * @param {string} averagingPeriod - '8hr' or '1hr'
   * @returns {number} AQI value
   */
  static calculateO3AQI(o3UgM3, averagingPeriod = '8hr') {
    // Convert μg/m³ to ppm
    const o3Ppm = this.ugM3ToPpm(o3UgM3, this.MW.o3);

    if (averagingPeriod === '8hr') {
      return this.calculateAQI(o3Ppm, AQI_BREAKPOINTS.o3_8hr);
    } else if (averagingPeriod === '1hr') {
      // 1-hour O3 only used when >= 0.125 ppm
      if (o3Ppm >= 0.125) {
        return this.calculateAQI(o3Ppm, AQI_BREAKPOINTS.o3_1hr);
      }
      return 0;
    } else {
      throw new Error("averaging_period must be '8hr' or '1hr'");
    }
  }

  /**
   * Calculate AQI for CO (convert μg/m³ to ppm)
   * @param {number} coUgM3 - CO concentration in μg/m³
   * @returns {number} AQI value
   */
  static calculateCOAQI(coUgM3) {
    const coPpm = this.ugM3ToPpm(coUgM3, this.MW.co);
    return this.calculateAQI(coPpm, AQI_BREAKPOINTS.co);
  }

  /**
   * Calculate AQI for SO2 (convert μg/m³ to ppb)
   * @param {number} so2UgM3 - SO2 concentration in μg/m³
   * @returns {number} AQI value
   */
  static calculateSO2AQI(so2UgM3) {
    const so2Ppb = this.ugM3ToPpb(so2UgM3, this.MW.so2);
    return this.calculateAQI(so2Ppb, AQI_BREAKPOINTS.so2);
  }

  /**
   * Calculate AQI for NO2 (convert μg/m³ to ppb)
   * @param {number} no2UgM3 - NO2 concentration in μg/m³
   * @returns {number} AQI value
   */
  static calculateNO2AQI(no2UgM3) {
    const no2Ppb = this.ugM3ToPpb(no2UgM3, this.MW.no2);
    return this.calculateAQI(no2Ppb, AQI_BREAKPOINTS.no2);
  }

  /**
   * Calculate AQI for all provided pollutants
   *
   * @param {Object} pollutants - Object with pollutant concentrations in μg/m³
   *                              Keys: 'pm25', 'pm10', 'o3', 'co', 'so2', 'no2'
   * @returns {Object} Object with AQI values for each pollutant
   */
  static calculateAllAQI(pollutants) {
    const aqiValues = {};

    if (pollutants.pm25 != null) {
      aqiValues.pm25 = this.calculatePM25AQI(pollutants.pm25);
    }

    if (pollutants.pm10 != null) {
      aqiValues.pm10 = this.calculatePM10AQI(pollutants.pm10);
    }

    if (pollutants.o3 != null) {
      aqiValues.o3 = this.calculateO3AQI(pollutants.o3, '8hr');
    }

    if (pollutants.co != null) {
      aqiValues.co = this.calculateCOAQI(pollutants.co);
    }

    if (pollutants.so2 != null) {
      aqiValues.so2 = this.calculateSO2AQI(pollutants.so2);
    }

    if (pollutants.no2 != null) {
      aqiValues.no2 = this.calculateNO2AQI(pollutants.no2);
    }

    return aqiValues;
  }

  /**
   * Determine overall AQI (highest of all pollutant AQIs)
   *
   * @param {Object} aqiValues - Object of pollutant AQI values
   * @returns {Object} Object with { aqi: number, pollutant: string }
   */
  static getOverallAQI(aqiValues) {
    if (Object.keys(aqiValues).length === 0) {
      return { aqi: 0, pollutant: 'none' };
    }

    let maxPollutant = null;
    let maxAQI = -1;

    for (const [pollutant, aqi] of Object.entries(aqiValues)) {
      if (aqi > maxAQI) {
        maxAQI = aqi;
        maxPollutant = pollutant;
      }
    }

    return { aqi: maxAQI, pollutant: maxPollutant };
  }

  /**
   * Get AQI category name for a given AQI value
   * @param {number} aqi - AQI value
   * @returns {string} Category name
   */
  static getAQICategory(aqi) {
    for (const [category, info] of Object.entries(AQI_CATEGORIES)) {
      const [low, high] = info.range;
      if (aqi >= low && aqi <= high) {
        return category;
      }
    }

    if (aqi > 500) {
      return 'Hazardous';
    }
    return 'Good';
  }

  /**
   * Get color code for a given AQI value
   * @param {number} aqi - AQI value
   * @returns {string} Hex color code
   */
  static getAQIColor(aqi) {
    const category = this.getAQICategory(aqi);
    return AQI_CATEGORIES[category].color;
  }

  /**
   * Get health description for a given AQI value
   * @param {number} aqi - AQI value
   * @returns {string} Health description
   */
  static getAQIDescription(aqi) {
    const category = this.getAQICategory(aqi);
    return AQI_CATEGORIES[category].description;
  }

  /**
   * Get complete AQI information for a given AQI value
   * @param {number} aqi - AQI value
   * @returns {Object} Complete AQI info with category, color, description
   */
  static getAQIInfo(aqi) {
    const category = this.getAQICategory(aqi);
    const categoryInfo = AQI_CATEGORIES[category];

    return {
      aqi,
      category,
      color: categoryInfo.color,
      description: categoryInfo.description,
      range: categoryInfo.range,
    };
  }
}

module.exports = AQICalculator;
