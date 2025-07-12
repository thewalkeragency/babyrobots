import { PrismaClient } from '@prisma/client';

// Global prisma instance for development
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, store Prisma client on global to avoid creating new connections
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Database connection check function
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully (Prisma)');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// User operations (Prisma-based)
export const createUser = async (userData) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.password_hash,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profileType: userData.profile_type,
      },
    });
    return { lastInsertRowid: user.id };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        artistProfile: true,
        fanProfile: true,
        licensorProfile: true,
        serviceProviderProfile: true,
      },
    });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const getUserById = async (id) => {
  try {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        artistProfile: true,
        fanProfile: true,
        licensorProfile: true,
        serviceProviderProfile: true,
      },
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Artist profile operations
export const createArtistProfile = async (profileData) => {
  try {
    const profile = await prisma.artistProfile.create({
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
      },
    });
    return { lastInsertRowid: profile.id };
  } catch (error) {
    console.error('Error creating artist profile:', error);
    throw error;
  }
};

export const getArtistProfile = async (userId) => {
  try {
    return await prisma.artistProfile.findUnique({
      where: { userId: parseInt(userId) },
      include: { user: true },
    });
  } catch (error) {
    console.error('Error getting artist profile:', error);
    return null;
  }
};

export const updateArtistProfile = async (userId, profileData) => {
  try {
    const result = await prisma.artistProfile.update({
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
      },
    });
    return { changes: 1 };
  } catch (error) {
    console.error('Error updating artist profile:', error);
    return { changes: 0 };
  }
};

export const deleteArtistProfile = async (userId) => {
  try {
    await prisma.artistProfile.delete({
      where: { userId: parseInt(userId) },
    });
    return { changes: 1 };
  } catch (error) {
    console.error('Error deleting artist profile:', error);
    return { changes: 0 };
  }
};

// Fan profile operations
export const createFanProfile = async (profileData) => {
  try {
    const profile = await prisma.fanProfile.create({
      data: {
        userId: profileData.user_id,
        displayName: profileData.display_name,
        favoriteGenres: profileData.favorite_genres,
        location: profileData.location,
        bio: profileData.bio,
      },
    });
    return { lastInsertRowid: profile.id };
  } catch (error) {
    console.error('Error creating fan profile:', error);
    throw error;
  }
};

export const getFanProfile = async (userId) => {
  try {
    return await prisma.fanProfile.findUnique({
      where: { userId: parseInt(userId) },
      include: { user: true },
    });
  } catch (error) {
    console.error('Error getting fan profile:', error);
    return null;
  }
};

// Chat operations
export const createChatSession = async (sessionData) => {
  try {
    const session = await prisma.chatSession.create({
      data: {
        userId: sessionData.user_id,
        sessionId: sessionData.session_id,
        role: sessionData.role,
      },
    });
    return { lastInsertRowid: session.id };
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

export const getChatSession = async (sessionId) => {
  try {
    return await prisma.chatSession.findUnique({
      where: { sessionId },
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

export const createChatMessage = async (messageData) => {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: messageData.session_id,
        message: messageData.message,
        response: messageData.response,
        role: messageData.role,
      },
    });
    return { lastInsertRowid: message.id };
  } catch (error) {
    console.error('Error creating chat message:', error);
    throw error;
  }
};

// Track operations
export const createTrack = async (trackData) => {
  try {
    const track = await prisma.track.create({
      data: {
        artistId: trackData.artist_id,
        title: trackData.title,
        duration: trackData.duration,
        genre: trackData.genre,
        mood: trackData.mood,
        bpm: trackData.bpm,
        keySignature: trackData.key_signature,
        fileUrl: trackData.file_url,
        artworkUrl: trackData.artwork_url,
        description: trackData.description,
        tags: trackData.tags,
        isPublic: trackData.is_public,
      },
    });
    return { lastInsertRowid: track.id };
  } catch (error) {
    console.error('Error creating track:', error);
    throw error;
  }
};

export const getTracksByArtist = async (artistId) => {
  try {
    return await prisma.track.findMany({
      where: { artistId: parseInt(artistId) },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting tracks by artist:', error);
    return [];
  }
};

// Profile validation (matches existing API)
export const validateProfileData = (profileType, data) => {
  const errors = [];
  
  switch (profileType) {
    case 'artist':
      if (!data.artist_name || data.artist_name.trim().length === 0) {
        errors.push('Artist name is required');
      }
      break;
    case 'fan':
      if (!data.display_name || data.display_name.trim().length === 0) {
        errors.push('Display name is required');
      }
      break;
    case 'licensor':
      if (!data.company_name || data.company_name.trim().length === 0) {
        errors.push('Company name is required');
      }
      break;
    case 'service_provider':
      if (!data.company_name || data.company_name.trim().length === 0) {
        errors.push('Company name is required');
      }
      if (!data.service_type || data.service_type.trim().length === 0) {
        errors.push('Service type is required');
      }
      break;
  }
  
  return errors;
};

export default prisma;
