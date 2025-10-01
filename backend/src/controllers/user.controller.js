const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Update user safety status
 */
exports.updateSafetyStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { isSafe } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (typeof isSafe !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Safety status (isSafe) must be a boolean'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isSafe,
        safetyUpdatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isSafe: true,
        safetyUpdatedAt: true,
        lastLocation: true
      }
    });

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update safety status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update safety status'
    });
  }
};

/**
 * Get user safety status
 */
exports.getSafetyStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isSafe: true,
        safetyUpdatedAt: true,
        lastLocation: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        isSafe: user.isSafe,
        safetyUpdatedAt: user.safetyUpdatedAt,
        location: user.lastLocation
      }
    });
  } catch (error) {
    console.error('Get safety status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get safety status'
    });
  }
};

/**
 * Update user location
 */
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { city, region, country, lat, lng } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!city || !lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'City, latitude, and longitude are required'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        lastLocation: {
          city,
          region,
          country,
          lat,
          lng
        }
      },
      select: {
        id: true,
        email: true,
        lastLocation: true
      }
    });

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update location'
    });
  }
};

/**
 * Get user profile with safety and location
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumbers: true,
        socialUsernames: true,
        lastLocation: true,
        isSafe: true,
        safetyUpdatedAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user profile'
    });
  }
};
