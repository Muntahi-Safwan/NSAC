const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NGOService {
  /**
   * Register a new NGO
   */
  async registerNGO(ngoData) {
    try {
      const { email, password, name, description, region, country, coordinates, contactPhone } = ngoData;

      // Check if NGO already exists
      const existingNGO = await prisma.nGO.findUnique({
        where: { email }
      });

      if (existingNGO) {
        throw new Error('NGO with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create NGO
      const ngo = await prisma.nGO.create({
        data: {
          email,
          password: hashedPassword,
          name,
          description,
          region,
          country: country || 'Bangladesh',
          coordinates,
          contactPhone,
          verified: false
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: ngo.id, email: ngo.email, type: 'ngo' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        ngo: {
          id: ngo.id,
          email: ngo.email,
          name: ngo.name,
          region: ngo.region,
          verified: ngo.verified
        },
        token
      };
    } catch (error) {
      console.error('NGO registration error:', error);
      throw error;
    }
  }

  /**
   * Login NGO
   */
  async loginNGO(email, password) {
    try {
      // Find NGO
      const ngo = await prisma.nGO.findUnique({
        where: { email }
      });

      if (!ngo) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, ngo.password);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: ngo.id, email: ngo.email, type: 'ngo' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        ngo: {
          id: ngo.id,
          email: ngo.email,
          name: ngo.name,
          region: ngo.region,
          country: ngo.country,
          verified: ngo.verified,
          description: ngo.description,
          contactPhone: ngo.contactPhone
        },
        token
      };
    } catch (error) {
      console.error('NGO login error:', error);
      throw error;
    }
  }

  /**
   * Get NGO profile
   */
  async getNGOProfile(ngoId) {
    try {
      const ngo = await prisma.nGO.findUnique({
        where: { id: ngoId },
        select: {
          id: true,
          email: true,
          name: true,
          description: true,
          region: true,
          country: true,
          coordinates: true,
          contactPhone: true,
          verified: true,
          createdAt: true
        }
      });

      if (!ngo) {
        throw new Error('NGO not found');
      }

      return {
        success: true,
        ngo
      };
    } catch (error) {
      console.error('Get NGO profile error:', error);
      throw error;
    }
  }

  /**
   * Update NGO profile
   */
  async updateNGOProfile(ngoId, updateData) {
    try {
      const { name, description, contactPhone, coordinates } = updateData;

      const ngo = await prisma.nGO.update({
        where: { id: ngoId },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(contactPhone && { contactPhone }),
          ...(coordinates && { coordinates })
        },
        select: {
          id: true,
          email: true,
          name: true,
          description: true,
          region: true,
          country: true,
          coordinates: true,
          contactPhone: true,
          verified: true
        }
      });

      return {
        success: true,
        ngo
      };
    } catch (error) {
      console.error('Update NGO profile error:', error);
      throw error;
    }
  }

  /**
   * Get regional users count and statistics
   */
  async getRegionalStats(ngoId) {
    try {
      const ngo = await prisma.nGO.findUnique({
        where: { id: ngoId }
      });

      if (!ngo) {
        throw new Error('NGO not found');
      }

      // Get users from the NGO's region
      const totalUsers = await prisma.user.count({
        where: {
          lastLocation: {
            path: ['city'],
            string_contains: ngo.region
          }
        }
      });

      // Get users marked as safe
      const safeUsers = await prisma.user.count({
        where: {
          lastLocation: {
            path: ['city'],
            string_contains: ngo.region
          },
          isSafe: true
        }
      });

      // Get users potentially at risk (not marked as safe)
      const atRiskUsers = await prisma.user.count({
        where: {
          lastLocation: {
            path: ['city'],
            string_contains: ngo.region
          },
          isSafe: false
        }
      });

      // Get recent notifications sent
      const recentNotifications = await prisma.notification.count({
        where: {
          ngoId: ngoId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      return {
        success: true,
        stats: {
          region: ngo.region,
          totalUsers,
          safeUsers,
          atRiskUsers,
          recentNotifications
        }
      };
    } catch (error) {
      console.error('Get regional stats error:', error);
      throw error;
    }
  }

  /**
   * Get regional users list with safety status
   */
  async getRegionalUsers(ngoId, page = 1, limit = 20) {
    try {
      const ngo = await prisma.nGO.findUnique({
        where: { id: ngoId }
      });

      if (!ngo) {
        throw new Error('NGO not found');
      }

      const skip = (page - 1) * limit;

      const users = await prisma.user.findMany({
        where: {
          lastLocation: {
            path: ['city'],
            string_contains: ngo.region
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isSafe: true,
          safetyUpdatedAt: true,
          lastLocation: true,
          phoneNumbers: true
        },
        skip,
        take: limit,
        orderBy: {
          safetyUpdatedAt: 'desc'
        }
      });

      const totalCount = await prisma.user.count({
        where: {
          lastLocation: {
            path: ['city'],
            string_contains: ngo.region
          }
        }
      });

      return {
        success: true,
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Get regional users error:', error);
      throw error;
    }
  }
}

module.exports = new NGOService();
