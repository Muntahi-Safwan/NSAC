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
          description: ngo.description,
          website: ngo.website,
          address: ngo.address,
          region: ngo.region,
          country: ngo.country,
          contactPhone: ngo.contactPhone,
          emergencyPhone: ngo.emergencyPhone,
          operatingHours: ngo.operatingHours,
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
          description: ngo.description,
          website: ngo.website,
          address: ngo.address,
          region: ngo.region,
          country: ngo.country,
          contactPhone: ngo.contactPhone,
          emergencyPhone: ngo.emergencyPhone,
          operatingHours: ngo.operatingHours,
          verified: ngo.verified
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
          website: true,
          address: true,
          region: true,
          country: true,
          coordinates: true,
          contactPhone: true,
          emergencyPhone: true,
          operatingHours: true,
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
      const {
        name,
        description,
        website,
        address,
        contactPhone,
        emergencyPhone,
        operatingHours,
        coordinates
      } = updateData;

      const dataToUpdate = {};
      if (name !== undefined) dataToUpdate.name = name;
      if (description !== undefined) dataToUpdate.description = description;
      if (website !== undefined) dataToUpdate.website = website;
      if (address !== undefined) dataToUpdate.address = address;
      if (contactPhone !== undefined) dataToUpdate.contactPhone = contactPhone;
      if (emergencyPhone !== undefined) dataToUpdate.emergencyPhone = emergencyPhone;
      if (operatingHours !== undefined) dataToUpdate.operatingHours = operatingHours;
      if (coordinates !== undefined) dataToUpdate.coordinates = coordinates;

      const ngo = await prisma.nGO.update({
        where: { id: ngoId },
        data: dataToUpdate,
        select: {
          id: true,
          email: true,
          name: true,
          description: true,
          website: true,
          address: true,
          region: true,
          country: true,
          coordinates: true,
          contactPhone: true,
          emergencyPhone: true,
          operatingHours: true,
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

      // Get all users with location data
      const allUsers = await prisma.user.findMany({
        where: {
          lastLocation: {
            not: null
          }
        },
        select: {
          id: true,
          lastLocation: true,
          isSafe: true
        }
      });

      // Filter users by region/city matching
      const regionalUsers = allUsers.filter(user => {
        if (!user.lastLocation) return false;
        const location = user.lastLocation;
        const region = location.region?.toLowerCase() || '';
        const city = location.city?.toLowerCase() || '';
        const ngoRegion = ngo.region.toLowerCase();

        return region.includes(ngoRegion) || city.includes(ngoRegion) ||
               ngoRegion.includes(region) || ngoRegion.includes(city);
      });

      const totalUsers = regionalUsers.length;
      const safeUsers = regionalUsers.filter(u => u.isSafe).length;
      const atRiskUsers = regionalUsers.filter(u => !u.isSafe).length;

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

      // Get all users with location data
      const allUsers = await prisma.user.findMany({
        where: {
          lastLocation: {
            not: null
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
          phoneNumbers: true,
          primaryPhone: true,
          age: true,
          diseases: true,
          allergies: true
        }
      });

      // Filter users by region/city matching
      const regionalUsers = allUsers.filter(user => {
        if (!user.lastLocation) return false;
        const location = user.lastLocation;
        const region = location.region?.toLowerCase() || '';
        const city = location.city?.toLowerCase() || '';
        const ngoRegion = ngo.region.toLowerCase();

        return region.includes(ngoRegion) || city.includes(ngoRegion) ||
               ngoRegion.includes(region) || ngoRegion.includes(city);
      });

      // Sort by safety status (at risk first) and then by safetyUpdatedAt
      regionalUsers.sort((a, b) => {
        if (a.isSafe !== b.isSafe) {
          return a.isSafe ? 1 : -1; // At risk users first
        }
        const aTime = a.safetyUpdatedAt ? new Date(a.safetyUpdatedAt).getTime() : 0;
        const bTime = b.safetyUpdatedAt ? new Date(b.safetyUpdatedAt).getTime() : 0;
        return bTime - aTime; // Most recent first
      });

      const totalCount = regionalUsers.length;
      const skip = (page - 1) * limit;
      const users = regionalUsers.slice(skip, skip + limit);

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
