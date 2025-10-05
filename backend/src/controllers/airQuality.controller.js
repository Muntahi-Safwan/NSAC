const { PrismaClient } = require('@prisma/client');
const AQICalculator = require('../utils/aqiCalculator');

const prisma = new PrismaClient();

/**
 * Air Quality Controller
 * Handles all air quality data endpoints
 */

/**
 * GET /api/air-quality/current
 * Get current air quality for a specific location
 * Query params: lat, lon, tolerance (optional, default 0.5)
 */
exports.getCurrentAirQuality = async (req, res) => {
  try {
    const { lat, lon, tolerance = 0.5 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const toleranceVal = parseFloat(tolerance);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
      });
    }

    // Get most recent data points within tolerance
    const dataPoints = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    if (!dataPoints || dataPoints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No air quality data found for this location',
      });
    }

    // Find the nearest point by calculating simple distance
    let nearest = null;
    let minDistance = Infinity;

    for (const point of dataPoints) {
      const latDiff = point.latitude - latitude;
      const lonDiff = point.longitude - longitude;
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    // Calculate AQI info if not already calculated
    if (!nearest.aqi) {
      const pollutants = {
        pm25: nearest.pm25,
        no2: nearest.no2,
        o3: nearest.o3,
        so2: nearest.so2,
        co: nearest.co,
      };

      const aqiValues = AQICalculator.calculateAllAQI(pollutants);
      const { aqi, pollutant } = AQICalculator.getOverallAQI(aqiValues);

      nearest = {
        ...nearest,
        aqi,
        dominantPollutant: pollutant,
        individualAQI: aqiValues,
      };
    }

    // Get AQI category information
    const aqiInfo = AQICalculator.getAQIInfo(nearest.aqi || 0);

    res.json({
      success: true,
      data: {
        ...nearest,
        aqiCategory: aqiInfo.category,
        aqiColor: aqiInfo.color,
        aqiDescription: aqiInfo.description,
        distance: minDistance,
      },
    });
  } catch (error) {
    console.error('Error fetching current air quality:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching air quality data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/forecast
 * Get 24-hour forecast for a specific location
 * Query params: lat, lon, tolerance (optional), hours (optional, default 24)
 */
exports.getForecast = async (req, res) => {
  try {
    const { lat, lon, tolerance = 0.5, hours = 24 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const toleranceVal = parseFloat(tolerance);
    const hoursAhead = parseInt(hours);

    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    const forecasts = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
        timestamp: {
          gte: now,
          lte: futureTime,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate AQI for each forecast if not present
    const enrichedForecasts = forecasts.map((forecast) => {
      if (!forecast.aqi) {
        const pollutants = {
          pm25: forecast.pm25,
          no2: forecast.no2,
          o3: forecast.o3,
          so2: forecast.so2,
          co: forecast.co,
        };

        const aqiValues = AQICalculator.calculateAllAQI(pollutants);
        const { aqi, pollutant } = AQICalculator.getOverallAQI(aqiValues);
        const aqiInfo = AQICalculator.getAQIInfo(aqi);

        return {
          ...forecast,
          aqi,
          dominantPollutant: pollutant,
          aqiCategory: aqiInfo.category,
          aqiColor: aqiInfo.color,
        };
      }

      const aqiInfo = AQICalculator.getAQIInfo(forecast.aqi);
      return {
        ...forecast,
        aqiCategory: aqiInfo.category,
        aqiColor: aqiInfo.color,
      };
    });

    res.json({
      success: true,
      data: enrichedForecasts,
      count: enrichedForecasts.length,
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecast data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/trends
 * Get historical 24-hour trends for a location
 * Query params: lat, lon, tolerance (optional), hours (optional, default 24)
 */
exports.getTrends = async (req, res) => {
  try {
    const { lat, lon, tolerance = 0.5, hours = 24 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const toleranceVal = parseFloat(tolerance);
    const hoursBack = parseInt(hours);

    const now = new Date();
    const pastTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    const trends = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
        timestamp: {
          gte: pastTime,
          lte: now,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate AQI for each trend point if not present
    const enrichedTrends = trends.map((trend) => {
      if (!trend.aqi) {
        const pollutants = {
          pm25: trend.pm25,
          no2: trend.no2,
          o3: trend.o3,
          so2: trend.so2,
          co: trend.co,
        };

        const aqiValues = AQICalculator.calculateAllAQI(pollutants);
        const { aqi, pollutant } = AQICalculator.getOverallAQI(aqiValues);
        const aqiInfo = AQICalculator.getAQIInfo(aqi);

        return {
          ...trend,
          aqi,
          dominantPollutant: pollutant,
          aqiCategory: aqiInfo.category,
          aqiColor: aqiInfo.color,
        };
      }

      const aqiInfo = AQICalculator.getAQIInfo(trend.aqi);
      return {
        ...trend,
        aqiCategory: aqiInfo.category,
        aqiColor: aqiInfo.color,
      };
    });

    res.json({
      success: true,
      data: enrichedTrends,
      count: enrichedTrends.length,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trend data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/map-data
 * Get air quality data for all regions for map visualization
 * Query params: limit (optional, default 500), minAQI (optional), maxAQI (optional)
 */
exports.getMapData = async (req, res) => {
  try {
    const { limit = 500, minAQI, maxAQI } = req.query;

    const limitVal = parseInt(limit);

    // Get most recent timestamp
    const latestRecord = await prisma.airQualityForecast.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
      },
    });

    if (!latestRecord) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No data available',
      });
    }

    // Get data from the most recent timestamp
    const whereClause = {
      timestamp: latestRecord.timestamp,
    };

    // Add AQI filters if provided
    if (minAQI) {
      whereClause.aqi = { ...whereClause.aqi, gte: parseFloat(minAQI) };
    }
    if (maxAQI) {
      whereClause.aqi = { ...whereClause.aqi, lte: parseFloat(maxAQI) };
    }

    const mapData = await prisma.airQualityForecast.findMany({
      where: whereClause,
      take: limitVal,
      orderBy: {
        aqi: 'desc', // Show worst air quality first
      },
    });

    // Enrich with AQI info
    const enrichedData = mapData.map((point) => {
      const aqi = point.aqi || 0;
      const aqiInfo = AQICalculator.getAQIInfo(aqi);

      return {
        id: point.id,
        latitude: point.latitude,
        longitude: point.longitude,
        aqi,
        aqiCategory: aqiInfo.category,
        aqiColor: aqiInfo.color,
        timestamp: point.timestamp,
        pollutants: {
          pm25: point.pm25,
          no2: point.no2,
          o3: point.o3,
          so2: point.so2,
          co: point.co,
          hcho: point.hcho,
        },
      };
    });

    res.json({
      success: true,
      data: enrichedData,
      count: enrichedData.length,
      timestamp: latestRecord.timestamp,
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching map data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/pollutants
 * Get detailed pollutant breakdown for a location
 * Query params: lat, lon, tolerance (optional)
 */
exports.getPollutantDetails = async (req, res) => {
  try {
    const { lat, lon, tolerance = 0.5 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const toleranceVal = parseFloat(tolerance);

    // Get most recent data
    const dataPoints = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1,
    });

    if (!dataPoints || dataPoints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pollutant data found for this location',
      });
    }

    const data = dataPoints[0];

    // Calculate individual AQI values for each pollutant
    const pollutants = {
      pm25: data.pm25,
      no2: data.no2,
      o3: data.o3,
      so2: data.so2,
      co: data.co,
    };

    const aqiValues = AQICalculator.calculateAllAQI(pollutants);

    // Helper function to map AQI category to level
    const getLevelFromCategory = (category) => {
      const categoryLower = category.toLowerCase();
      if (categoryLower === 'good') return 'good';
      if (categoryLower === 'moderate') return 'moderate';
      if (categoryLower.includes('unhealthy') || categoryLower.includes('sensitive')) return 'unhealthy';
      if (categoryLower === 'hazardous') return 'hazardous';
      return 'moderate';
    };

    // Create detailed breakdown with descriptions
    const pollutantDetails = [];

    if (data.pm25 != null) {
      const aqiInfo = AQICalculator.getAQIInfo(aqiValues.pm25);
      pollutantDetails.push({
        name: 'PM2.5',
        value: parseFloat(data.pm25.toFixed(1)),
        unit: 'μg/m³',
        aqi: aqiValues.pm25,
        level: getLevelFromCategory(aqiInfo.category),
        description: 'Fine Particulate Matter - Deep Lung Penetration',
      });
    }

    if (data.no2 != null) {
      const aqiInfo = AQICalculator.getAQIInfo(aqiValues.no2);
      pollutantDetails.push({
        name: 'NO₂',
        value: parseFloat(data.no2.toFixed(1)),
        unit: 'μg/m³',
        aqi: aqiValues.no2,
        level: getLevelFromCategory(aqiInfo.category),
        description: 'Nitrogen Dioxide - Traffic & Industrial Pollution',
      });
    }

    if (data.o3 != null) {
      const aqiInfo = AQICalculator.getAQIInfo(aqiValues.o3);
      pollutantDetails.push({
        name: 'O₃',
        value: parseFloat(data.o3.toFixed(1)),
        unit: 'μg/m³',
        aqi: aqiValues.o3,
        level: getLevelFromCategory(aqiInfo.category),
        description: 'Ozone - Photochemical Smog Formation',
      });
    }

    if (data.so2 != null) {
      const aqiInfo = AQICalculator.getAQIInfo(aqiValues.so2);
      pollutantDetails.push({
        name: 'SO₂',
        value: parseFloat(data.so2.toFixed(1)),
        unit: 'μg/m³',
        aqi: aqiValues.so2,
        level: getLevelFromCategory(aqiInfo.category),
        description: 'Sulfur Dioxide - Industrial & Power Generation',
      });
    }

    if (data.co != null) {
      const aqiInfo = AQICalculator.getAQIInfo(aqiValues.co);
      pollutantDetails.push({
        name: 'CO',
        value: parseFloat(data.co.toFixed(1)),
        unit: 'μg/m³',
        aqi: aqiValues.co,
        level: getLevelFromCategory(aqiInfo.category),
        description: 'Carbon Monoxide - Incomplete Combustion',
      });
    }

    if (data.hcho != null) {
      pollutantDetails.push({
        name: 'HCHO',
        value: parseFloat(data.hcho.toFixed(1)),
        unit: 'μg/m³',
        level: data.hcho < 30 ? 'good' : data.hcho < 60 ? 'moderate' : 'unhealthy',
        description: 'Formaldehyde - Indoor & Outdoor Air Pollutant',
      });
    }

    const { aqi, pollutant } = AQICalculator.getOverallAQI(aqiValues);
    const overallInfo = AQICalculator.getAQIInfo(aqi);

    res.json({
      success: true,
      data: {
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        timestamp: data.timestamp,
        overall: {
          aqi,
          dominantPollutant: pollutant,
          category: overallInfo.category,
          color: overallInfo.color,
          description: overallInfo.description,
        },
        pollutants: pollutantDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching pollutant details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pollutant details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/aqi
 * Get AQI data for AQI Speedometer component
 * Query params: lat, lon, tolerance (optional)
 */
exports.getAQIData = async (req, res) => {
  try {
    const { lat, lon, tolerance = 0.5 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const toleranceVal = parseFloat(tolerance);

    // Get most recent data
    const dataPoints = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1,
    });

    if (!dataPoints || dataPoints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No AQI data found for this location',
      });
    }

    const data = dataPoints[0];

    // Calculate AQI if not present
    let aqi = data.aqi;
    if (!aqi) {
      const pollutants = {
        pm25: data.pm25,
        no2: data.no2,
        o3: data.o3,
        so2: data.so2,
        co: data.co,
      };
      const aqiValues = AQICalculator.calculateAllAQI(pollutants);
      const result = AQICalculator.getOverallAQI(aqiValues);
      aqi = result.aqi;
    }

    const aqiInfo = AQICalculator.getAQIInfo(aqi);

    // Map category to level
    const getLevelFromCategory = (category) => {
      const categoryLower = category.toLowerCase();
      if (categoryLower === 'good') return 'good';
      if (categoryLower === 'moderate') return 'moderate';
      if (categoryLower.includes('unhealthy') && categoryLower.includes('sensitive')) return 'unhealthy';
      if (categoryLower.includes('unhealthy') && !categoryLower.includes('very')) return 'unhealthy';
      if (categoryLower.includes('very') && categoryLower.includes('unhealthy')) return 'very_unhealthy';
      if (categoryLower === 'hazardous') return 'hazardous';
      return 'moderate';
    };

    res.json({
      success: true,
      data: {
        value: Math.round(aqi),
        level: getLevelFromCategory(aqiInfo.category),
        description: aqiInfo.description,
        color: aqiInfo.color,
        aqi: Math.round(aqi),
        timestamp: data.timestamp,
      },
    });
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AQI data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/trends-data
 * Get past and future trend data for charts
 * Query params: lat, lon, tolerance (optional), hours (optional)
 */
exports.getTrendsData = async (req, res) => {
  try {
    const { lat, lon, tolerance = 0.5, hours = 24 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const toleranceVal = parseFloat(tolerance);
    const hoursNum = parseInt(hours);

    const now = new Date();
    const pastTime = new Date(now.getTime() - hoursNum * 60 * 60 * 1000);
    const futureTime = new Date(now.getTime() + hoursNum * 60 * 60 * 1000);

    // Get past data from realtime table
    const pastData = await prisma.airQualityRealtime.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
        timestamp: {
          gte: pastTime,
          lte: now,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
        aqi: true,
        pm25: true,
        no2: true,
        o3: true,
        so2: true,
        co: true,
      },
    });

    // Get forecast data
    const forecastData = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
        timestamp: {
          gte: now,
          lte: futureTime,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
        aqi: true,
        pm25: true,
        no2: true,
        o3: true,
        so2: true,
        co: true,
      },
    });

    // Get forecast for past period (for comparison)
    const pastForecastData = await prisma.airQualityForecast.findMany({
      where: {
        latitude: {
          gte: latitude - toleranceVal,
          lte: latitude + toleranceVal,
        },
        longitude: {
          gte: longitude - toleranceVal,
          lte: longitude + toleranceVal,
        },
        timestamp: {
          gte: pastTime,
          lte: now,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
        aqi: true,
      },
    });

    // Format past trend data (actual vs predicted)
    const pastTrend = pastData.map((actual, index) => {
      const predicted = pastForecastData.find(
        (f) => Math.abs(new Date(f.timestamp).getTime() - new Date(actual.timestamp).getTime()) < 3600000
      );

      const pollutants = {
        pm25: actual.pm25,
        no2: actual.no2,
        o3: actual.o3,
        so2: actual.so2,
        co: actual.co,
      };
      const aqiValues = AQICalculator.calculateAllAQI(pollutants);
      const { aqi } = AQICalculator.getOverallAQI(aqiValues);

      return {
        hour: index,
        time: new Date(actual.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        actual: Math.round(actual.aqi || aqi),
        predicted: predicted ? Math.round(predicted.aqi) : null,
        timestamp: actual.timestamp,
      };
    });

    // Format future trend data (predicted only)
    const futureTrend = forecastData.map((forecast, index) => {
      const pollutants = {
        pm25: forecast.pm25,
        no2: forecast.no2,
        o3: forecast.o3,
        so2: forecast.so2,
        co: forecast.co,
      };
      const aqiValues = AQICalculator.calculateAllAQI(pollutants);
      const { aqi } = AQICalculator.getOverallAQI(aqiValues);

      return {
        hour: index + pastTrend.length,
        time: new Date(forecast.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        predicted: Math.round(forecast.aqi || aqi),
        timestamp: forecast.timestamp,
      };
    });

    res.json({
      success: true,
      data: {
        past: pastTrend,
        future: futureTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching trends data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trends data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/air-quality/statistics
 * Get database statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const totalRecords = await prisma.airQualityForecast.count();

    if (totalRecords === 0) {
      return res.json({
        success: true,
        data: {
          totalRecords: 0,
          oldestRecord: null,
          newestRecord: null,
          sources: [],
        },
      });
    }

    // Get oldest and newest records
    const oldest = await prisma.airQualityForecast.findFirst({
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
      },
    });

    const newest = await prisma.airQualityForecast.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
      },
    });

    // Get unique sources
    const sources = await prisma.airQualityForecast.findMany({
      distinct: ['source'],
      select: {
        source: true,
      },
    });

    // Get AQI distribution
    const aqiStats = await prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE aqi >= 0 AND aqi <= 50) as good,
        COUNT(*) FILTER (WHERE aqi > 50 AND aqi <= 100) as moderate,
        COUNT(*) FILTER (WHERE aqi > 100 AND aqi <= 150) as unhealthy_sensitive,
        COUNT(*) FILTER (WHERE aqi > 150 AND aqi <= 200) as unhealthy,
        COUNT(*) FILTER (WHERE aqi > 200 AND aqi <= 300) as very_unhealthy,
        COUNT(*) FILTER (WHERE aqi > 300) as hazardous,
        AVG(aqi) as avg_aqi
      FROM air_quality_forecasts
      WHERE aqi IS NOT NULL
    `;

    res.json({
      success: true,
      data: {
        totalRecords,
        oldestRecord: oldest?.timestamp,
        newestRecord: newest?.timestamp,
        sources: sources.map((s) => s.source),
        aqiDistribution: aqiStats[0] || {},
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
