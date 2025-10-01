const ngoService = require('../services/ngo.service');

/**
 * Register new NGO
 */
exports.register = async (req, res) => {
  try {
    const ngoData = req.body;

    if (!ngoData.email || !ngoData.password || !ngoData.name || !ngoData.region) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and region are required'
      });
    }

    const result = await ngoService.registerNGO(ngoData);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('NGO registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to register NGO'
    });
  }
};

/**
 * Login NGO
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await ngoService.loginNGO(email, password);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('NGO login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials'
    });
  }
};

/**
 * Get NGO profile
 */
exports.getProfile = async (req, res) => {
  try {
    const ngoId = req.ngo?.id || req.params.ngoId;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    const result = await ngoService.getNGOProfile(ngoId);

    res.json({
      success: true,
      data: result.ngo
    });
  } catch (error) {
    console.error('Get NGO profile error:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'NGO not found'
    });
  }
};

/**
 * Update NGO profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const ngoId = req.ngo?.id || req.body.ngoId;
    const updateData = req.body;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    const result = await ngoService.updateNGOProfile(ngoId, updateData);

    res.json({
      success: true,
      data: result.ngo
    });
  } catch (error) {
    console.error('Update NGO profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
};

/**
 * Get regional statistics
 */
exports.getRegionalStats = async (req, res) => {
  try {
    const ngoId = req.ngo?.id || req.params.ngoId;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    const result = await ngoService.getRegionalStats(ngoId);

    res.json({
      success: true,
      data: result.stats
    });
  } catch (error) {
    console.error('Get regional stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get statistics'
    });
  }
};

/**
 * Get regional users
 */
exports.getRegionalUsers = async (req, res) => {
  try {
    const ngoId = req.ngo?.id || req.params.ngoId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    const result = await ngoService.getRegionalUsers(ngoId, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get regional users error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get regional users'
    });
  }
};
