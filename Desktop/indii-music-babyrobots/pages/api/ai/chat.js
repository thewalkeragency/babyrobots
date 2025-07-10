import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'Google Gemini API key not configured.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    try {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      res.status(200).json({ reply: text });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ error: 'Failed to get response from AI.', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
