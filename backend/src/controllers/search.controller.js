const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Search users by phone, social profiles, or name
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    console.log('🔍 Searching for users with query:', query);

    const searchTerm = query.trim().toLowerCase();

    // Search across multiple fields
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // Search by phone numbers (primary phone)
          {
            primaryPhone: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by phone numbers array
          {
            phoneNumbers: {
              hasSome: [searchTerm]
            }
          },
          // Search by first name
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by last name
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by email
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        primaryPhone: true,
        phoneNumbers: true,
        age: true,
        diseases: true,
        allergies: true,
        isSafe: true,
        safetyUpdatedAt: true,
        lastLocation: true,
        socialUsernames: true,
        createdAt: true
      }
    });

    // Additionally search by social usernames (stored in JSON)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        primaryPhone: true,
        phoneNumbers: true,
        age: true,
        diseases: true,
        allergies: true,
        isSafe: true,
        safetyUpdatedAt: true,
        lastLocation: true,
        socialUsernames: true,
        createdAt: true
      }
    });

    // Filter users by social usernames
    const socialMatches = allUsers.filter(user => {
      if (!user.socialUsernames) return false;

      const social = user.socialUsernames;
      const searchLower = searchTerm.toLowerCase();

      return (
        (social.twitter && social.twitter.toLowerCase().includes(searchLower)) ||
        (social.linkedin && social.linkedin.toLowerCase().includes(searchLower)) ||
        (social.github && social.github.toLowerCase().includes(searchLower)) ||
        (social.instagram && social.instagram.toLowerCase().includes(searchLower))
      );
    });

    // Combine results and remove duplicates
    const combinedUsers = [...users, ...socialMatches];
    const uniqueUsers = Array.from(
      new Map(combinedUsers.map(user => [user.id, user])).values()
    );

    console.log(`✅ Found ${uniqueUsers.length} users matching query`);

    // Format response
    const formattedUsers = uniqueUsers.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      email: user.email,
      primaryPhone: user.primaryPhone,
      phoneNumbers: user.phoneNumbers,
      age: user.age,
      diseases: user.diseases,
      allergies: user.allergies,
      isSafe: user.isSafe,
      safetyStatus: user.isSafe ? 'Safe' : 'Need Help',
      safetyUpdatedAt: user.safetyUpdatedAt,
      location: user.lastLocation ? {
        city: user.lastLocation.city,
        region: user.lastLocation.region,
        country: user.lastLocation.country
      } : null,
      socialProfiles: user.socialUsernames || {},
      lastUpdated: user.safetyUpdatedAt || user.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      query: query,
      data: formattedUsers
    });

  } catch (error) {
    console.error('❌ Error in search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
      message: error.message
    });
  }
};

// Get user safety status by ID
exports.getUserSafetyStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        primaryPhone: true,
        isSafe: true,
        safetyUpdatedAt: true,
        lastLocation: true,
        age: true,
        diseases: true,
        allergies: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        safetyStatus: user.isSafe ? 'Safe' : 'Need Help',
        location: user.lastLocation
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user safety status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user safety status'
    });
  }
};
