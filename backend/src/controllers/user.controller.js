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
    console.log('📍 Update location request received:', req.body);

    const userId = req.user?.id || req.body.userId;
    const { city, region, country, lat, lng } = req.body;

    console.log('👤 User ID:', userId);
    console.log('📌 Location data:', { city, region, country, lat, lng });

    if (!userId) {
      console.log('❌ No user ID provided');
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!city || lat === undefined || lng === undefined) {
      console.log('❌ Missing required fields:', { city, lat, lng });
      return res.status(400).json({
        success: false,
        error: 'City, latitude, and longitude are required'
      });
    }

    const locationData = {
      city,
      region: region || null,
      country: country || 'Unknown',
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    console.log('💾 Saving location data:', locationData);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        lastLocation: locationData
      },
      select: {
        id: true,
        email: true,
        lastLocation: true
      }
    });

    console.log('✅ Location saved successfully:', user.lastLocation);

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('❌ Update location error:', error);
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
        primaryPhone: true,
        socialUsernames: true,
        age: true,
        diseases: true,
        allergies: true,
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

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const {
      firstName,
      lastName,
      phoneNumbers,
      primaryPhone,
      socialUsernames,
      age,
      diseases,
      allergies
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Build update data object
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
    if (primaryPhone !== undefined) updateData.primaryPhone = primaryPhone;
    if (socialUsernames !== undefined) updateData.socialUsernames = socialUsernames;
    if (age !== undefined) updateData.age = parseInt(age);
    if (diseases !== undefined) updateData.diseases = diseases;
    if (allergies !== undefined) updateData.allergies = allergies;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumbers: true,
        primaryPhone: true,
        socialUsernames: true,
        age: true,
        diseases: true,
        allergies: true,
        lastLocation: true,
        isSafe: true,
        safetyUpdatedAt: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user profile'
    });
  }
};
