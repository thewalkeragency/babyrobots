import { 
  createFanProfile, 
  getFanProfile, 
  updateFanProfile, 
  deleteFanProfile,
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
        // Get fan profile
        const profile = getFanProfile(parseInt(userId));
        if (!profile) {
          return res.status(404).json({ error: 'Fan profile not found' });
        }
        return res.status(200).json({ profile });

      case 'POST':
        // Create fan profile
        const { profileData } = req.body;
        
        if (!profileData) {
          return res.status(400).json({ error: 'Profile data is required' });
        }

        // Validate profile data
        const validationErrors = validateProfileData('fan', profileData);
        if (validationErrors.length > 0) {
          return res.status(400).json({ errors: validationErrors });
        }

        // Verify user exists and has fan profile type
        const user = getUserById(parseInt(userId));
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        if (user.profile_type !== 'fan') {
          return res.status(400).json({ error: 'User must have fan profile type' });
        }

        // Check if profile already exists
        const existingProfile = getFanProfile(parseInt(userId));
        if (existingProfile) {
          return res.status(409).json({ error: 'Fan profile already exists for this user' });
        }

        const createData = {
          user_id: parseInt(userId),
          ...profileData
        };

        const createResult = createFanProfile(createData);
        const newProfile = getFanProfile(parseInt(userId));
        
        return res.status(201).json({ 
          message: 'Fan profile created successfully',
          profile: newProfile 
        });

      case 'PUT':
        // Update fan profile
        const { updateData } = req.body;
        
        if (!updateData) {
          return res.status(400).json({ error: 'Update data is required' });
        }

        // Validate update data
        const updateValidationErrors = validateProfileData('fan', updateData);
        if (updateValidationErrors.length > 0) {
          return res.status(400).json({ errors: updateValidationErrors });
        }

        // Check if profile exists
        const existingUpdateProfile = getFanProfile(parseInt(userId));
        if (!existingUpdateProfile) {
          return res.status(404).json({ error: 'Fan profile not found' });
        }

        const updateResult = updateFanProfile(parseInt(userId), updateData);
        const updatedProfile = getFanProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Fan profile updated successfully',
          profile: updatedProfile 
        });

      case 'DELETE':
        // Delete fan profile
        const existingDeleteProfile = getFanProfile(parseInt(userId));
        if (!existingDeleteProfile) {
          return res.status(404).json({ error: 'Fan profile not found' });
        }

        const deleteResult = deleteFanProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Fan profile deleted successfully' 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Fan profile API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
