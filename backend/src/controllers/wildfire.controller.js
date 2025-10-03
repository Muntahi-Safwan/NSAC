const firmsService = require('../services/firms.service');

/**
 * Get active wildfires from NASA FIRMS
 */
exports.getActiveFires = async (req, res) => {
  try {
    const { source, area, dayRange } = req.query;

    const result = await firmsService.getActiveFires(
      source || 'VIIRS_NOAA20_NRT',
      area || 'world',
      parseInt(dayRange) || 1
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in getActiveFires controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active fires',
      message: error.message
    });
  }
};

/**
 * Get fires by region
 */
exports.getFiresByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const result = await firmsService.getFiresByRegion(region);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in getFiresByRegion controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fires by region',
      message: error.message
    });
  }
};

/**
 * Get fire statistics
 */
exports.getFireStatistics = async (req, res) => {
  try {
    const result = await firmsService.getFireStatistics();

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in getFireStatistics controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fire statistics',
      message: error.message
    });
  }
};

module.exports = exports;
