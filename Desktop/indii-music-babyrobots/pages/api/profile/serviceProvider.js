import { createServiceProviderProfile, getServiceProviderProfileByUserId, updateServiceProviderProfile, deleteServiceProviderProfile } from '../../../src/lib/db';

export default async function handler(req, res) {
  const userId = req.method === 'GET' ? req.query.userId : req.body.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID missing.' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus } = req.body;
        if (!businessName) {
          return res.status(400).json({ message: 'Business name is required to create a service provider profile.' });
        }
        const profileId = createServiceProviderProfile(userId, businessName, serviceCategories ? JSON.stringify(serviceCategories) : null, skills ? JSON.stringify(skills) : null, experienceYears, portfolioUrls ? JSON.stringify(portfolioUrls) : null, rates ? JSON.stringify(rates) : null, availabilityStatus);
        res.status(201).json({ message: 'Service provider profile created successfully!', profileId });
      } catch (error) {
        console.error('Error creating service provider profile:', error);
        res.status(500).json({ message: 'Internal server error creating service provider profile.' });
      }
      break;

    case 'GET':
      try {
        const profile = getServiceProviderProfileByUserId(userId);
        if (profile) {
          res.status(200).json(profile);
        } else {
          res.status(404).json({ message: 'Service provider profile not found.' });
        }
      } catch (error) {
        console.error('Error fetching service provider profile:', error);
        res.status(500).json({ message: 'Internal server error fetching service provider profile.' });
      }
      break;

    case 'PUT':
      try {
        const { businessName, serviceCategories, skills, experienceYears, portfolioUrls, rates, availabilityStatus } = req.body;
        const changes = updateServiceProviderProfile(userId, businessName, serviceCategories ? JSON.stringify(serviceCategories) : null, skills ? JSON.stringify(skills) : null, experienceYears, portfolioUrls ? JSON.stringify(portfolioUrls) : null, rates ? JSON.stringify(rates) : null, availabilityStatus);
        if (changes > 0) {
          res.status(200).json({ message: 'Service provider profile updated successfully!' });
        } else {
          res.status(404).json({ message: 'Service provider profile not found or no changes made.' });
        }
      } catch (error) {
        console.error('Error updating service provider profile:', error);
        res.status(500).json({ message: 'Internal server error updating service provider profile.' });
      }
      break;

    case 'DELETE':
      try {
        const changes = deleteServiceProviderProfile(userId);
        if (changes > 0) {
          res.status(200).json({ message: 'Service provider profile deleted successfully!' });
        } else {
          res.status(404).json({ message: 'Service provider profile not found.' });
        }
      } catch (error) {
        console.error('Error deleting service provider profile:', error);
        res.status(500).json({ message: 'Internal server error deleting service provider profile.' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
