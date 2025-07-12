import { 
  createServiceProviderProfile, 
  getServiceProviderProfile, 
  updateServiceProviderProfile, 
  deleteServiceProviderProfile,
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
        // Get service provider profile
        const profile = getServiceProviderProfile(parseInt(userId));
        if (!profile) {
          return res.status(404).json({ error: 'Service provider profile not found' });
        }
        return res.status(200).json({ profile });

      case 'POST':
        // Create service provider profile
        const { profileData } = req.body;
        
        if (!profileData) {
          return res.status(400).json({ error: 'Profile data is required' });
        }

        // Validate profile data
        const validationErrors = validateProfileData('service_provider', profileData);
        if (validationErrors.length > 0) {
          return res.status(400).json({ errors: validationErrors });
        }

        // Verify user exists and has service_provider profile type
        const user = getUserById(parseInt(userId));
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        if (user.profile_type !== 'service_provider') {
          return res.status(400).json({ error: 'User must have service_provider profile type' });
        }

        // Check if profile already exists
        const existingProfile = getServiceProviderProfile(parseInt(userId));
        if (existingProfile) {
          return res.status(409).json({ error: 'Service provider profile already exists for this user' });
        }

        const createData = {
          user_id: parseInt(userId),
          ...profileData
        };

        const createResult = createServiceProviderProfile(createData);
        const newProfile = getServiceProviderProfile(parseInt(userId));
        
        return res.status(201).json({ 
          message: 'Service provider profile created successfully',
          profile: newProfile 
        });

      case 'PUT':
        // Update service provider profile
        const { updateData } = req.body;
        
        if (!updateData) {
          return res.status(400).json({ error: 'Update data is required' });
        }

        // Validate update data
        const updateValidationErrors = validateProfileData('service_provider', updateData);
        if (updateValidationErrors.length > 0) {
          return res.status(400).json({ errors: updateValidationErrors });
        }

        // Check if profile exists
        const existingUpdateProfile = getServiceProviderProfile(parseInt(userId));
        if (!existingUpdateProfile) {
          return res.status(404).json({ error: 'Service provider profile not found' });
        }

        const updateResult = updateServiceProviderProfile(parseInt(userId), updateData);
        const updatedProfile = getServiceProviderProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Service provider profile updated successfully',
          profile: updatedProfile 
        });

      case 'DELETE':
        // Delete service provider profile
        const existingDeleteProfile = getServiceProviderProfile(parseInt(userId));
        if (!existingDeleteProfile) {
          return res.status(404).json({ error: 'Service provider profile not found' });
        }

        const deleteResult = deleteServiceProviderProfile(parseInt(userId));
        
        return res.status(200).json({ 
          message: 'Service provider profile deleted successfully' 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Service provider profile API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
