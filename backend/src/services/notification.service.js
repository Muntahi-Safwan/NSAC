const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NotificationService {
  /**
   * Create and send notification to regional users
   */
  async createNotification(ngoId, notificationData) {
    try {
      const { title, message, severity, isAlert, expiresAt } = notificationData;

      // Get NGO details
      const ngo = await prisma.nGO.findUnique({
        where: { id: ngoId }
      });

      if (!ngo) {
        throw new Error('NGO not found');
      }

      // Get all users from the NGO's region
      const regionalUsers = await prisma.user.findMany({
        where: {
          lastLocation: {
            path: ['city'],
            string_contains: ngo.region
          }
        }
      });

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          ngoId,
          title,
          message,
          severity: severity || 'info',
          region: ngo.region,
          isAlert: isAlert || false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          recipients: {
            connect: regionalUsers.map(user => ({ id: user.id }))
          }
        },
        include: {
          ngo: {
            select: {
              name: true,
              region: true
            }
          }
        }
      });

      return {
        success: true,
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          isAlert: notification.isAlert,
          region: notification.region,
          recipientCount: regionalUsers.length,
          createdAt: notification.createdAt
        }
      };
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Get notifications sent by NGO
   */
  async getNGONotifications(ngoId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await prisma.notification.findMany({
        where: { ngoId },
        include: {
          _count: {
            select: { recipients: true }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totalCount = await prisma.notification.count({
        where: { ngoId }
      });

      return {
        success: true,
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          severity: n.severity,
          isAlert: n.isAlert,
          region: n.region,
          recipientCount: n._count.recipients,
          createdAt: n.createdAt,
          expiresAt: n.expiresAt
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Get NGO notifications error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await prisma.notification.findMany({
        where: {
          recipients: {
            some: {
              id: userId
            }
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        },
        include: {
          ngo: {
            select: {
              name: true,
              region: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totalCount = await prisma.notification.count({
        where: {
          recipients: {
            some: {
              id: userId
            }
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        }
      });

      return {
        success: true,
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          severity: n.severity,
          isAlert: n.isAlert,
          ngoName: n.ngo.name,
          region: n.region,
          createdAt: n.createdAt
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Get active alerts for a region
   */
  async getActiveAlerts(region) {
    try {
      const alerts = await prisma.notification.findMany({
        where: {
          region,
          isAlert: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        },
        include: {
          ngo: {
            select: {
              name: true,
              contactPhone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        alerts: alerts.map(a => ({
          id: a.id,
          title: a.title,
          message: a.message,
          severity: a.severity,
          ngoName: a.ngo.name,
          ngoContact: a.ngo.contactPhone,
          createdAt: a.createdAt,
          expiresAt: a.expiresAt
        }))
      };
    } catch (error) {
      console.error('Get active alerts error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(ngoId, notificationId) {
    try {
      // Verify NGO owns this notification
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          ngoId
        }
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
