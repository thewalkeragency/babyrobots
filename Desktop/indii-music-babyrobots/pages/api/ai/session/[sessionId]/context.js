import { getChatSession, updateSessionContext } from '../../../../../lib/db'; // Adjust path as needed

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (req.method === 'POST') {
    const { contextData } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    if (contextData === undefined) { // contextData can be null, but not undefined
      return res.status(400).json({ error: 'contextData is required in the request body.' });
    }

    try {
      // Check if the session exists
      const session = getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: `Session with ID ${sessionId} not found.` });
      }

      // Update the session context
      const result = updateSessionContext(sessionId, contextData);

      if (result.changes > 0) {
        res.status(200).json({ message: 'Context saved successfully.' });
      } else {
        // This case might occur if the session ID was valid but the update somehow affected 0 rows.
        // Could be treated as a server error or a more specific error if the cause is identifiable.
        // For now, let's assume if session exists, update should work or throw an error caught below.
        // If getChatSession found it, but updateSessionContext found 0 changes, it's odd.
        // It might also mean the context was the same as what was already stored,
        // though updateSessionContext doesn't check for that.
        // Let's refine to check if session existed first.
        return res.status(500).json({ error: 'Failed to update context. Session found but no changes made.' });
      }
    } catch (error) {
      console.error(`Error updating context for session ${sessionId}:`, error);
      // Check if the error is due to foreign key constraint or other known DB issue
      if (error.message.includes('FOREIGN KEY constraint failed')) { // Example check
          return res.status(404).json({ error: `Session with ID ${sessionId} not found or related data error.` });
      }
      res.status(500).json({ error: 'Internal server error while saving context.', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
