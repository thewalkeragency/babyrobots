import { routePostRequest } from '../../../src/lib/api-utils';

// API route for social media post drafting
// POST /api/social/post

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { content, hashtags, platform } = req.body;

  try {
    // Generate post through AI
    const postResult = await routePostRequest(content, hashtags, platform);

    res.status(200).json({ success: true, data: postResult });
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
