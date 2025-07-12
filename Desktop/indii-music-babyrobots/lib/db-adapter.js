// Hybrid Database Adapter
// Supports both SQLite (current) and Prisma/Supabase (new) for seamless migration

const { isSupabaseConfigured } = require('./supabase');

// Import both database systems
const sqliteDb = require('./db'); // Current SQLite implementation
let prisma = null;

// Only import Prisma if Supabase is configured
if (isSupabaseConfigured) {
  try {
    prisma = require('./prisma');
  } catch (error) {
    console.warn('Prisma not available, using SQLite only:', error.message);
  }
}

// Database adapter that routes to the appropriate database
class DatabaseAdapter {
  constructor() {
    this.usePostgres = isSupabaseConfigured && prisma;
    console.log(`Database Adapter initialized: ${this.usePostgres ? 'PostgreSQL (Prisma)' : 'SQLite'}`);
  }

  // User operations
  async createUser(userData) {
    if (this.usePostgres) {
      return await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: userData.password_hash,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name,
          profileType: userData.profile_type,
        }
      });
    } else {
      return sqliteDb.createUser(userData);
    }
  }

  async getUserByEmail(email) {
    if (this.usePostgres) {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          artistProfile: true,
          fanProfile: true,
          licensorProfile: true,
          serviceProviderProfile: true,
        }
      });
    } else {
      return sqliteDb.getUserByEmail(email);
    }
  }

  async getUserById(id) {
    if (this.usePostgres) {
      return await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          artistProfile: true,
          fanProfile: true,
          licensorProfile: true,
          serviceProviderProfile: true,
        }
      });
    } else {
      return sqliteDb.getUserById(id);
    }
  }

  // Artist profile operations
  async createArtistProfile(profileData) {
    if (this.usePostgres) {
      return await prisma.artistProfile.create({
        data: {
          userId: profileData.user_id,
          artistName: profileData.artist_name,
          bio: profileData.bio,
          genre: profileData.genre,
          location: profileData.location,
          website: profileData.website,
          spotifyUrl: profileData.spotify_url,
          soundcloudUrl: profileData.soundcloud_url,
          instagramUrl: profileData.instagram_url,
          twitterUrl: profileData.twitter_url,
        }
      });
    } else {
      return sqliteDb.createArtistProfile(profileData);
    }
  }

  async getArtistProfile(userId) {
    if (this.usePostgres) {
      return await prisma.artistProfile.findUnique({
        where: { userId: parseInt(userId) },
        include: { user: true }
      });
    } else {
      return sqliteDb.getArtistProfile(userId);
    }
  }

  async updateArtistProfile(userId, profileData) {
    if (this.usePostgres) {
      return await prisma.artistProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          artistName: profileData.artist_name,
          bio: profileData.bio,
          genre: profileData.genre,
          location: profileData.location,
          website: profileData.website,
          spotifyUrl: profileData.spotify_url,
          soundcloudUrl: profileData.soundcloud_url,
          instagramUrl: profileData.instagram_url,
          twitterUrl: profileData.twitter_url,
        }
      });
    } else {
      return sqliteDb.updateArtistProfile(userId, profileData);
    }
  }

  async deleteArtistProfile(userId) {
    if (this.usePostgres) {
      return await prisma.artistProfile.delete({
        where: { userId: parseInt(userId) }
      });
    } else {
      return sqliteDb.deleteArtistProfile(userId);
    }
  }

  // Fan profile operations
  async createFanProfile(profileData) {
    if (this.usePostgres) {
      return await prisma.fanProfile.create({
        data: {
          userId: profileData.user_id,
          displayName: profileData.display_name,
          favoriteGenres: profileData.favorite_genres,
          location: profileData.location,
          bio: profileData.bio,
        }
      });
    } else {
      return sqliteDb.createFanProfile(profileData);
    }
  }

  async getFanProfile(userId) {
    if (this.usePostgres) {
      return await prisma.fanProfile.findUnique({
        where: { userId: parseInt(userId) },
        include: { user: true }
      });
    } else {
      return sqliteDb.getFanProfile(userId);
    }
  }

  async updateFanProfile(userId, profileData) {
    if (this.usePostgres) {
      return await prisma.fanProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          displayName: profileData.display_name,
          favoriteGenres: profileData.favorite_genres,
          location: profileData.location,
          bio: profileData.bio,
        }
      });
    } else {
      return sqliteDb.updateFanProfile(userId, profileData);
    }
  }

  async deleteFanProfile(userId) {
    if (this.usePostgres) {
      return await prisma.fanProfile.delete({
        where: { userId: parseInt(userId) }
      });
    } else {
      return sqliteDb.deleteFanProfile(userId);
    }
  }

  // Licensor profile operations
  async createLicensorProfile(profileData) {
    if (this.usePostgres) {
      return await prisma.licensorProfile.create({
        data: {
          userId: profileData.user_id,
          companyName: profileData.company_name,
          contactPerson: profileData.contact_person,
          industryFocus: profileData.industry_focus,
          website: profileData.website,
          phone: profileData.phone,
          address: profileData.address,
        }
      });
    } else {
      return sqliteDb.createLicensorProfile(profileData);
    }
  }

  async getLicensorProfile(userId) {
    if (this.usePostgres) {
      return await prisma.licensorProfile.findUnique({
        where: { userId: parseInt(userId) },
        include: { user: true }
      });
    } else {
      return sqliteDb.getLicensorProfile(userId);
    }
  }

  async updateLicensorProfile(userId, profileData) {
    if (this.usePostgres) {
      return await prisma.licensorProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          companyName: profileData.company_name,
          contactPerson: profileData.contact_person,
          industryFocus: profileData.industry_focus,
          website: profileData.website,
          phone: profileData.phone,
          address: profileData.address,
        }
      });
    } else {
      return sqliteDb.updateLicensorProfile(userId, profileData);
    }
  }

  async deleteLicensorProfile(userId) {
    if (this.usePostgres) {
      return await prisma.licensorProfile.delete({
        where: { userId: parseInt(userId) }
      });
    } else {
      return sqliteDb.deleteLicensorProfile(userId);
    }
  }

  // Service provider profile operations
  async createServiceProviderProfile(profileData) {
    if (this.usePostgres) {
      return await prisma.serviceProviderProfile.create({
        data: {
          userId: profileData.user_id,
          companyName: profileData.company_name,
          serviceType: profileData.service_type,
          description: profileData.description,
          website: profileData.website,
          contactEmail: profileData.contact_email,
          phone: profileData.phone,
          pricingInfo: profileData.pricing_info,
        }
      });
    } else {
      return sqliteDb.createServiceProviderProfile(profileData);
    }
  }

  async getServiceProviderProfile(userId) {
    if (this.usePostgres) {
      return await prisma.serviceProviderProfile.findUnique({
        where: { userId: parseInt(userId) },
        include: { user: true }
      });
    } else {
      return sqliteDb.getServiceProviderProfile(userId);
    }
  }

  async updateServiceProviderProfile(userId, profileData) {
    if (this.usePostgres) {
      return await prisma.serviceProviderProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          companyName: profileData.company_name,
          serviceType: profileData.service_type,
          description: profileData.description,
          website: profileData.website,
          contactEmail: profileData.contact_email,
          phone: profileData.phone,
          pricingInfo: profileData.pricing_info,
        }
      });
    } else {
      return sqliteDb.updateServiceProviderProfile(userId, profileData);
    }
  }

  async deleteServiceProviderProfile(userId) {
    if (this.usePostgres) {
      return await prisma.serviceProviderProfile.delete({
        where: { userId: parseInt(userId) }
      });
    } else {
      return sqliteDb.deleteServiceProviderProfile(userId);
    }
  }

  // Helper methods
  async getUserWithProfile(userId) {
    if (this.usePostgres) {
      return await this.getUserById(userId);
    } else {
      return sqliteDb.getUserWithProfile(userId);
    }
  }

  // Health check method
  async healthCheck() {
    try {
      if (this.usePostgres) {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'healthy', database: 'PostgreSQL (Prisma)' };
      } else {
        // For SQLite, we can check if we can query users table
        sqliteDb.getUserById(1); // This will not throw if DB is accessible
        return { status: 'healthy', database: 'SQLite' };
      }
    } catch (error) {
      return { status: 'error', database: this.usePostgres ? 'PostgreSQL' : 'SQLite', error: error.message };
    }
  }
}

// Export singleton instance
const dbAdapter = new DatabaseAdapter();
module.exports = dbAdapter;
