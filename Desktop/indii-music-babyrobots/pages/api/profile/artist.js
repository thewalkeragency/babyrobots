import { createArtistProfile, getArtistProfileByUserId, updateArtistProfile, deleteArtistProfile } from '../../../src/lib/db';

export default async function handler(req, res) {
  // In a real application, you would authenticate the user here
  // and get their user ID from a session or JWT.
  // For now, we'll assume the user ID is passed in the request body for simplicity.
  const userId = req.method === 'GET' ? req.query.userId : req.body.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID missing.' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl } = req.body;
        if (!stageName) {
          return res.status(400).json({ message: 'Stage name is required to create an artist profile.' });
        }
        const profileId = createArtistProfile(userId, stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks ? JSON.stringify(socialLinks) : null, profileImageUrl);
        res.status(201).json({ message: 'Artist profile created successfully!', profileId });
      } catch (error) {
        console.error('Error creating artist profile:', error);
        res.status(500).json({ message: 'Internal server error creating artist profile.' });
      }
      break;

    case 'GET':
      try {
        const profile = getArtistProfileByUserId(userId);
        if (profile) {
          res.status(200).json(profile);
        } else {
          res.status(404).json({ message: 'Artist profile not found.' });
        }
      } catch (error) {
        console.error('Error fetching artist profile:', error);
        res.status(500).json({ message: 'Internal server error fetching artist profile.' });
      }
      break;

    case 'PUT':
      try {
        const { stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks, profileImageUrl } = req.body;
        const changes = updateArtistProfile(userId, stageName, legalName, bio, website, proAffiliation, ipiNumber, socialLinks ? JSON.stringify(socialLinks) : null, profileImageUrl);
        if (changes > 0) {
          res.status(200).json({ message: 'Artist profile updated successfully!' });
        } else {
          res.status(404).json({ message: 'Artist profile not found or no changes made.' });
        }
      } catch (error) {
        console.error('Error updating artist profile:', error);
        res.status(500).json({ message: 'Internal server error updating artist profile.' });
      }
      break;

    case 'DELETE':
      try {
        const changes = deleteArtistProfile(userId);
        if (changes > 0) {
          res.status(200).json({ message: 'Artist profile deleted successfully!' });
        } else {
          res.status(404).json({ message: 'Artist profile not found.' });
        }
      } catch (error) {
        console.error('Error deleting artist profile:', error);
        res.status(500).json({ message: 'Internal server error deleting artist profile.' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
