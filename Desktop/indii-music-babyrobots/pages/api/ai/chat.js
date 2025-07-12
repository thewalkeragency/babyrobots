import { GoogleGenerativeAI } from '@google/generative-ai';
const { getChatSession, createChatMessage } = require('../../../src/lib/db-adapter');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message, history, sessionId, userId } = req.body; // Added sessionId and userId

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'Google Gemini API key not configured.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    try {
      const result = await chat.sendMessage(message);
      const aiResponse = await result.response;
      const aiResponseText = aiResponse.text();

      // If sessionId is provided, try to save the chat message
      if (sessionId) {
        try {
          const session = getChatSession(sessionId);
          if (session) {
            createChatMessage({
              session_id: sessionId,
              message: message, // User's message
              response: aiResponseText, // AI's response
              role: session.role || 'user', // Use session's role or default to 'user'
            });
            // Not critical to wait for this or check result for sending HTTP response
            console.log(`Chat message saved for session ${sessionId}`);
          } else {
            console.warn(`Session ID ${sessionId} provided but not found. Chat not saved.`);
            // Optionally, if userId is provided, one could attempt to create a session here.
            // For now, we only save if session exists.
          }
        } catch (dbError) {
          console.error(`Error saving chat message for session ${sessionId}:`, dbError);
          // Do not let DB error prevent sending AI response back to user
        }
      }

      res.status(200).json({ reply: aiResponseText });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ error: 'Failed to get response from AI.', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
