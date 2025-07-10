import { createFanProfile, getFanProfileByUserId, updateFanProfile, deleteFanProfile } from '../../../src/lib/db';

export default async function handler(req, res) {
  // In a real application, you would authenticate the user here
  // and get their user ID from a session or JWT.
  // For now, we'll assume the user ID is passed in the request body/query for simplicity.
  const userId = req.method === 'GET' ? req.query.userId : req.body.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID missing.' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { displayName, musicPreferences, listeningHistory } = req.body;
        if (!displayName) {
          return res.status(400).json({ message: 'Display name is required to create a fan profile.' });
        }
        const profileId = createFanProfile(userId, displayName, musicPreferences ? JSON.stringify(musicPreferences) : null, listeningHistory ? JSON.stringify(listeningHistory) : null);
        res.status(201).json({ message: 'Fan profile created successfully!', profileId });
      } catch (error) {
        console.error('Error creating fan profile:', error);
        res.status(500).json({ message: 'Internal server error creating fan profile.' });
      }
      break;

    case 'GET':
      try {
        const profile = getFanProfileByUserId(userId);
        if (profile) {
          res.status(200).json(profile);
        } else {
          res.status(404).json({ message: 'Fan profile not found.' });
        }
      } catch (error) {
        console.error('Error fetching fan profile:', error);
        res.status(500).json({ message: 'Internal server error fetching fan profile.' });
      }
      break;

    case 'PUT':
      try {
        const { displayName, musicPreferences, listeningHistory } = req.body;
        const changes = updateFanProfile(userId, displayName, musicPreferences ? JSON.stringify(musicPreferences) : null, listeningHistory ? JSON.stringify(listeningHistory) : null);
        if (changes > 0) {
          res.status(200).json({ message: 'Fan profile updated successfully!' });
        } else {
          res.status(404).json({ message: 'Fan profile not found or no changes made.' });
        }
      } catch (error) {
        console.error('Error updating fan profile:', error);
        res.status(500).json({ message: 'Internal server error updating fan profile.' });
      }
      break;

    case 'DELETE':
      try {
        const changes = deleteFanProfile(userId);
        if (changes > 0) {
          res.status(200).json({ message: 'Fan profile deleted successfully!' });
        } else {
          res.status(404).json({ message: 'Fan profile not found.' });
        }
      } catch (error) {
        console.error('Error deleting fan profile:', error);
        res.status(500).json({ message: 'Internal server error deleting fan profile.' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
