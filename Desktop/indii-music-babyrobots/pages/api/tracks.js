import { createTrack, getTrackById, updateTrack, deleteTrack, getTracksByArtistId } from '@/lib/db';

export default async function handler(req, res) {
  // In a real application, you would authenticate the user here
  // and get their user ID from a session or JWT.
  // For now, we'll assume the artistId is passed in the request body/query for simplicity.
  const artistId = req.method === 'GET' ? req.query.artistId : req.body.artistId;
  const trackId = req.query.id; // For GET, PUT, DELETE by ID

  if (!artistId && req.method !== 'GET') { // artistId is not required for GET all tracks
    return res.status(401).json({ message: 'Unauthorized: Artist ID missing.' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { title, albumTitle, genre, moodTags, instrumentation, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags, fileUrl, coverArtUrl } = req.body;
        if (!title || !artistId) {
          return res.status(400).json({ message: 'Title and Artist ID are required to create a track.' });
        }
        const newTrackId = createTrack(artistId, title, albumTitle, genre, moodTags ? JSON.stringify(moodTags) : null, instrumentation ? JSON.stringify(instrumentation) : null, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags ? JSON.stringify(aiTags) : null, fileUrl, coverArtUrl);
        res.status(201).json({ message: 'Track created successfully!', trackId: newTrackId });
      } catch (error) {
        console.error('Error creating track:', error);
        res.status(500).json({ message: 'Internal server error creating track.' });
      }
      break;

    case 'GET':
      try {
        if (trackId) {
          const track = getTrackById(trackId);
          if (track) {
            res.status(200).json(track);
          } else {
            res.status(404).json({ message: 'Track not found.' });
          }
        } else if (artistId) {
          const tracks = getTracksByArtistId(artistId);
          res.status(200).json(tracks);
        } else {
          // In a real app, you might return all public tracks or require an artistId
          res.status(400).json({ message: 'Track ID or Artist ID is required to fetch tracks.' });
        }
      } catch (error) {
        console.error('Error fetching track(s):', error);
        res.status(500).json({ message: 'Internal server error fetching track(s).' });
      }
      break;

    case 'PUT':
      try {
        if (!trackId) {
          return res.status(400).json({ message: 'Track ID is required to update a track.' });
        }
        const { title, albumTitle, genre, moodTags, instrumentation, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags, fileUrl, coverArtUrl } = req.body;
        const changes = updateTrack(trackId, artistId, title, albumTitle, genre, moodTags ? JSON.stringify(moodTags) : null, instrumentation ? JSON.stringify(instrumentation) : null, tempoBpm, keySignature, durationSeconds, isrc, iswc, explicitContent, language, releaseDate, originalReleaseDate, copyrightHolder, aiTags ? JSON.stringify(aiTags) : null, fileUrl, coverArtUrl);
        if (changes > 0) {
          res.status(200).json({ message: 'Track updated successfully!' });
        } else {
          res.status(404).json({ message: 'Track not found or no changes made.' });
        }
      } catch (error) {
        console.error('Error updating track:', error);
        res.status(500).json({ message: 'Internal server error updating track.' });
      }
      break;

    case 'DELETE':
      try {
        if (!trackId) {
          return res.status(400).json({ message: 'Track ID is required to delete a track.' });
        }
        const changes = deleteTrack(trackId);
        if (changes > 0) {
          res.status(200).json({ message: 'Track deleted successfully!' });
        } else {
          res.status(404).json({ message: 'Track not found.' });
        }
      } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ message: 'Internal server error deleting track.' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
