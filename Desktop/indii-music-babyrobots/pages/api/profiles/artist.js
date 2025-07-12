import { 
  createArtistProfile, 
  getArtistProfile, 
  updateArtistProfile, 
  deleteArtistProfile,
  validateProfileData,
  getUserById
} from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;
  const { userId } = req.query;

  // Basic validation
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        // Get artist profile
        const profile = getArtistProfile(parseInt(userId));
        if (!profile) {
          return res.status(404).json({ error: 'Artist profile not found' });
        }
        return res.status(200).json({ profile });

      case 'POST':
        // Create artist profile
        const { profileData } = req.body;
        
        if (!profileData) {
          return res.status(400).json({ error: 'Profile data is required' });
        }

        // Validate profile data
        const validationErrors = validateProfileData('artist', profileData);
        if (validationErrors.length > 0) {
          return res.status(400).json({ errors: validationErrors });
        }

        // Verify user exists and has artist profile type
        const user = getUserById(parseInt(userId));
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        if (user.profile_type !== 'artist') {
          return res.status(400).json({ error: 'User must have artist profile type' });
        }

        // Check if profile already exists
        const existingProfile = getArtistProfile(parseInt(userId));
        if (existingProfile) {
          return res.status(409).json({ error: 'Artist profile already exists for this user' });
        }

        const createData = {
          user_id: parseInt(userId),
          ...profileData
        };

        const createResult = createArtistProfile(createData);
        const newProfile = getArtistProfile(parseInt(userId));
        
        return res.status(201).json({ 
          message: 'Artist profile created successfully',
          profile: newProfile 
        });

      case 'PUT':
        // Update artist profile
        const { updateData } = req.body;
        
        if (!updateData) {
          return res.status(400).json({ error: 'Update data is required' });
        }

        // Validate update data
        const updateValidationErrors = validateProfileData('artist', updateData);
        if (updateValidationErrors.length > 0) {
          return res.status(400).json({ errors: updateValidationErrors });
        }

        // Check if profile exists
        const existingUpdateProfile = getArtistProfile(parseInt(userId));
        if (!existingUpdateProfile) {
          return res.status(404).json({ error: 'Artist profile not found' });
        }

        const updateResult = updateArtistProfile(parseInt(userId), updateData);
        const updatedProfile = getArtistProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Artist profile updated successfully',
          profile: updatedProfile 
        });

      case 'DELETE':
        // Delete artist profile
        const existingDeleteProfile = getArtistProfile(parseInt(userId));
        if (!existingDeleteProfile) {
          return res.status(404).json({ error: 'Artist profile not found' });
        }

        const deleteResult = deleteArtistProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Artist profile deleted successfully' 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Artist profile API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
