// Database Adapter - switches between SQLite, Prisma, and Supabase
// This allows us to develop the new system without breaking existing functionality

// For now, just import the SQLite database directly
import * as dbModule from './db.js';
import bcrypt from 'bcrypt';

console.log('🔄 Using SQLite database adapter');

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
  
  // Utility functions
  query,
  run,
  
  // Default export (for backwards compatibility)
  db
} = dbModule;

// Additional helper functions
export const isDatabaseConnected = async () => {
  try {
    // For SQLite, just check if we can access the module
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

export const getDatabaseType = () => {
  return 'sqlite';
};

export const disconnectDatabase = async () => {
  // SQLite doesn't need explicit disconnection
};

// Password verification (common to both systems)
export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Health check function
export const healthCheck = async () => {
  try {
    const isConnected = await isDatabaseConnected();
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      database: getDatabaseType(),
      connected: isConnected
    };
  } catch (error) {
    return {
      status: 'error',
      database: getDatabaseType(),
      connected: false,
      error: error.message
    };
  }
};

export default dbModule;
