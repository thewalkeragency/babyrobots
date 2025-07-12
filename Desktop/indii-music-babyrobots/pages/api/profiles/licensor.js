import { 
  createLicensorProfile, 
  getLicensorProfile, 
  updateLicensorProfile, 
  deleteLicensorProfile,
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
        // Get licensor profile
        const profile = getLicensorProfile(parseInt(userId));
        if (!profile) {
          return res.status(404).json({ error: 'Licensor profile not found' });
        }
        return res.status(200).json({ profile });

      case 'POST':
        // Create licensor profile
        const { profileData } = req.body;
        
        if (!profileData) {
          return res.status(400).json({ error: 'Profile data is required' });
        }

        // Validate profile data
        const validationErrors = validateProfileData('licensor', profileData);
        if (validationErrors.length > 0) {
          return res.status(400).json({ errors: validationErrors });
        }

        // Verify user exists and has licensor profile type
        const user = getUserById(parseInt(userId));
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        if (user.profile_type !== 'licensor') {
          return res.status(400).json({ error: 'User must have licensor profile type' });
        }

        // Check if profile already exists
        const existingProfile = getLicensorProfile(parseInt(userId));
        if (existingProfile) {
          return res.status(409).json({ error: 'Licensor profile already exists for this user' });
        }

        const createData = {
          user_id: parseInt(userId),
          ...profileData
        };

        const createResult = createLicensorProfile(createData);
        const newProfile = getLicensorProfile(parseInt(userId));
        
        return res.status(201).json({ 
          message: 'Licensor profile created successfully',
          profile: newProfile 
        });

      case 'PUT':
        // Update licensor profile
        const { updateData } = req.body;
        
        if (!updateData) {
          return res.status(400).json({ error: 'Update data is required' });
        }

        // Validate update data
        const updateValidationErrors = validateProfileData('licensor', updateData);
        if (updateValidationErrors.length > 0) {
          return res.status(400).json({ errors: updateValidationErrors });
        }

        // Check if profile exists
        const existingUpdateProfile = getLicensorProfile(parseInt(userId));
        if (!existingUpdateProfile) {
          return res.status(404).json({ error: 'Licensor profile not found' });
        }

        const updateResult = updateLicensorProfile(parseInt(userId), updateData);
        const updatedProfile = getLicensorProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Licensor profile updated successfully',
          profile: updatedProfile 
        });

      case 'DELETE':
        // Delete licensor profile
        const existingDeleteProfile = getLicensorProfile(parseInt(userId));
        if (!existingDeleteProfile) {
          return res.status(404).json({ error: 'Licensor profile not found' });
        }

        const deleteResult = deleteLicensorProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Licensor profile deleted successfully' 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Licensor profile API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
