import AIRouter from './ai-router';
import { searchKnowledge } from './knowledge-base';

// Route post request to AI for content generation
export async function routePostRequest(content, hashtags = [], platform) {
  const aiRouter = new AIRouter();

  // Build message for AI
  const message = `Create a social media post for ${platform} with content: "${content}"`;

  // Fetch suggested hashtags from knowledge base
  const suggestedHashtags = searchKnowledge('hashtags', 'artist')
    .map(({ content }) => content.toLowerCase())
    .filter((tag) => !hashtags.includes(tag));

  // Call AI to generate post content
  const postContent = await aiRouter.route(message, { role: 'artist' });

  return {
    content: postContent,
    hashtags: [...hashtags, ...suggestedHashtags],
  };
}

