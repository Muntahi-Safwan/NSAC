const notificationService = require('../services/notification.service');

/**
 * Create notification
 */
exports.createNotification = async (req, res) => {
  try {
    const ngoId = req.ngo?.id || req.body.ngoId;
    const notificationData = req.body;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    if (!notificationData.title || !notificationData.message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    const result = await notificationService.createNotification(ngoId, notificationData);

    res.status(201).json({
      success: true,
      data: result.notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create notification'
    });
  }
};

/**
 * Get NGO's notifications
 */
exports.getNGONotifications = async (req, res) => {
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

    const result = await notificationService.getNGONotifications(ngoId, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get NGO notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get notifications'
    });
  }
};

/**
 * Get user's notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await notificationService.getUserNotifications(userId, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get notifications'
    });
  }
};

/**
 * Get active alerts for region
 */
exports.getActiveAlerts = async (req, res) => {
  try {
    const { region } = req.query;

    if (!region) {
      return res.status(400).json({
        success: false,
        error: 'Region is required'
      });
    }

    const result = await notificationService.getActiveAlerts(region);

    res.json({
      success: true,
      data: result.alerts
    });
  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get alerts'
    });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const ngoId = req.ngo?.id || req.body.ngoId;
    const { notificationId } = req.params;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        error: 'NGO ID is required'
      });
    }

    const result = await notificationService.deleteNotification(ngoId, notificationId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete notification'
    });
  }
};
