// Database Adapter - switches between SQLite, Prisma, and Supabase
// This allows us to develop the new system without breaking existing functionality

// Environment flags to control which database to use
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USE_PRISMA = process.env.USE_PRISMA === 'true' || process.env.DATABASE_URL?.includes('postgresql');
const DB_PRIORITY = USE_SUPABASE ? 'supabase' : (USE_PRISMA ? 'prisma' : 'sqlite');

let dbModule;

try {
  if (USE_PRISMA) {
    // Try to use Prisma if environment is configured for it
    dbModule = require('./db-prisma.js');
    console.log('🔄 Using Prisma database adapter');
  } else {
    // Fall back to SQLite
    dbModule = require('../../lib/db.js');
    console.log('🔄 Using SQLite database adapter');
  }
} catch (error) {
  console.warn('⚠️ Primary database failed, falling back to SQLite:', error.message);
  // Always fall back to SQLite if Prisma fails
  dbModule = require('../../lib/db.js');
}

// Export all database functions - this maintains API compatibility
export const {
  // User operations
  createUser,
  getUserByEmail,
  getUserById,
  
  // Artist profile operations
  createArtistProfile,
  getArtistProfile,
  updateArtistProfile,
  deleteArtistProfile,
  
  // Fan profile operations
  createFanProfile,
  getFanProfile,
  updateFanProfile,
  deleteFanProfile,
  
  // Licensor profile operations
  createLicensorProfile,
  getLicensorProfile,
  updateLicensorProfile,
  deleteLicensorProfile,
  
  // Service provider operations
  createServiceProviderProfile,
  getServiceProviderProfile,
  updateServiceProviderProfile,
  deleteServiceProviderProfile,
  
  // Chat operations
  createChatSession,
  getChatSession,
  createChatMessage,
  getChatHistory,
  updateChatSessionActivity,
  
  // Track operations
  createTrack,
  getTracksByArtist,
  getTrackById,
  
  // Validation
  validateProfileData,
  
  // Profile management
  getUserWithProfile,
  updateUserProfileType,
  
  // Search functions
  searchArtistProfiles,
  searchFanProfiles,
  searchLicensorProfiles,
  searchServiceProviderProfiles,
  getProfilesByType,
  
  // Workspace operations
  createProjectWorkspace,
  getWorkspacesByUser,
  getWorkspaceById,
  createWorkspaceFile,
  getFilesByWorkspace,
  createWorkspaceTask,
  getTasksByWorkspace,
  updateTaskCompletion,
  
  // Audio files
  createAudioFile,
  
  // Split sheets
  createSplitSheet,
  getSplitSheetsByTrack,
  createSplitSheetContributor,
  getContributorsBySplitSheet,
  
  // Session context
  updateSessionContext,
  getSessionContext,
  
  // Default export (for backwards compatibility)
  db
} = dbModule;

// Additional helper functions
export const isDatabaseConnected = async () => {
  try {
    if (USE_PRISMA && dbModule.checkDatabaseConnection) {
      return await dbModule.checkDatabaseConnection();
    } else {
      // For SQLite, just check if we can access the module
      return true;
    }
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

export const getDatabaseType = () => {
  return USE_PRISMA ? 'prisma' : 'sqlite';
};

export const disconnectDatabase = async () => {
  if (USE_PRISMA && dbModule.disconnectDatabase) {
    await dbModule.disconnectDatabase();
  }
};

// Password verification (common to both systems)
export const verifyPassword = (password, hashedPassword) => {
  const bcrypt = require('bcrypt');
  return bcrypt.compareSync(password, hashedPassword);
};

export default dbModule;
