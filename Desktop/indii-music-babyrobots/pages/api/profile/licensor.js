import { createLicensorProfile, getLicensorProfileByUserId, updateLicensorProfile, deleteLicensorProfile } from '../../../src/lib/db';

export default async function handler(req, res) {
  const userId = req.method === 'GET' ? req.query.userId : req.body.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID missing.' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { companyName, contactPerson, industry, budgetRange, licensingNeeds } = req.body;
        if (!companyName) {
          return res.status(400).json({ message: 'Company name is required to create a licensor profile.' });
        }
        const profileId = createLicensorProfile(userId, companyName, contactPerson, industry, budgetRange, licensingNeeds);
        res.status(201).json({ message: 'Licensor profile created successfully!', profileId });
      } catch (error) {
        console.error('Error creating licensor profile:', error);
        res.status(500).json({ message: 'Internal server error creating licensor profile.' });
      }
      break;

    case 'GET':
      try {
        const profile = getLicensorProfileByUserId(userId);
        if (profile) {
          res.status(200).json(profile);
        } else {
          res.status(404).json({ message: 'Licensor profile not found.' });
        }
      } catch (error) {
        console.error('Error fetching licensor profile:', error);
        res.status(500).json({ message: 'Internal server error fetching licensor profile.' });
      }
      break;

    case 'PUT':
      try {
        const { companyName, contactPerson, industry, budgetRange, licensingNeeds } = req.body;
        const changes = updateLicensorProfile(userId, companyName, contactPerson, industry, budgetRange, licensingNeeds);
        if (changes > 0) {
          res.status(200).json({ message: 'Licensor profile updated successfully!' });
        } else {
          res.status(404).json({ message: 'Licensor profile not found or no changes made.' });
        }
      } catch (error) {
        console.error('Error updating licensor profile:', error);
        res.status(500).json({ message: 'Internal server error updating licensor profile.' });
      }
      break;

    case 'DELETE':
      try {
        const changes = deleteLicensorProfile(userId);
        if (changes > 0) {
          res.status(200).json({ message: 'Licensor profile deleted successfully!' });
        } else {
          res.status(404).json({ message: 'Licensor profile not found.' });
        }
      } catch (error) {
        console.error('Error deleting licensor profile:', error);
        res.status(500).json({ message: 'Internal server error deleting licensor profile.' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
