// Import the specific functions from lib/db that the API handler uses
// and mock them.
import { getChatSession, updateSessionContext } from '../../src/lib/db-adapter';
import handler from '../../pages/api/ai/session/[sessionId]/context';
import { jest } from '@jest/globals';

// Mock the imported db functions
jest.mock('../../lib/db', () => ({
  getChatSession: jest.fn(),
  updateSessionContext: jest.fn(),
}));

// Helper to create mock req/res objects
const mockReqRes = (method, query, body) => {
  const req = { method, query, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return { req, res };
};

describe('API Handler: /api/ai/session/[sessionId]/context (Direct Handler Test)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getChatSession.mockReset();
    updateSessionContext.mockReset();
  });

  it('should save context for a valid session ID', async () => {
    const sessionId = 'test-session-direct-save';
    const contextData = { preference: 'dark_mode', value: true };
    const { req, res } = mockReqRes('POST', { sessionId }, { contextData });

    getChatSession.mockReturnValue({ id: 1, session_id: sessionId }); // Simulate session exists
    updateSessionContext.mockReturnValue({ changes: 1 }); // Simulate successful update

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Context saved successfully.' });
    expect(getChatSession).toHaveBeenCalledWith(sessionId);
    expect(updateSessionContext).toHaveBeenCalledWith(sessionId, contextData);
  });

  it('should return 404 if session ID does not exist', async () => {
    const sessionId = 'non-existent-session-direct';
    const contextData = { preference: 'light_mode' };
    const { req, res } = mockReqRes('POST', { sessionId }, { contextData });

    getChatSession.mockReturnValue(null); // Simulate session does not exist

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: `Session with ID ${sessionId} not found.` });
    expect(getChatSession).toHaveBeenCalledWith(sessionId);
    expect(updateSessionContext).not.toHaveBeenCalled();
  });

  it('should return 400 if contextData is missing from request body', async () => {
    const sessionId = 'session-bad-request-direct';
    // req.body will be {} if contextData is missing, or pass undefined
    const { req, res } = mockReqRes('POST', { sessionId }, {});

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'contextData is required in the request body.' });
    expect(getChatSession).not.toHaveBeenCalled();
  });

  it('should return 400 if sessionId is missing from query', async () => {
    const contextData = { data: 'test' };
    const { req, res } = mockReqRes('POST', {}, { contextData }); // No sessionId in query

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Session ID is required.' });
  });

  it('should return 405 for non-POST requests', async () => {
    const sessionId = 'any-session-direct';
    const { req, res } = mockReqRes('GET', { sessionId }, null);

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith(`Method GET Not Allowed`);
  });

  it('should return 500 if updateSessionContext indicates no changes made', async () => {
    const sessionId = 'session-update-nochange-direct';
    const contextData = { data: 'some data' };
    const { req, res } = mockReqRes('POST', { sessionId }, { contextData });

    getChatSession.mockReturnValue({ id: 1, session_id: sessionId });
    updateSessionContext.mockReturnValue({ changes: 0 }); // Simulate update affecting 0 rows

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update context. Session found but no changes made.' });
  });

  it('should return 500 if db operation (updateSessionContext) throws an error', async () => {
    const sessionId = 'session-db-error-direct';
    const contextData = { data: 'some data' };
    const { req, res } = mockReqRes('POST', { sessionId }, { contextData });
    const dbError = new Error('Simulated DB error');

    getChatSession.mockReturnValue({ id: 1, session_id: sessionId });
    updateSessionContext.mockImplementation(() => {
      throw dbError;
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error while saving context.', details: dbError.message });
  });

  it('should return 500 if db operation (getChatSession) throws an error', async () => {
    const sessionId = 'session-db-error-get-direct';
    const contextData = { data: 'some data' };
    const { req, res } = mockReqRes('POST', { sessionId }, { contextData });
    const dbError = new Error('Simulated DB GET error');

    getChatSession.mockImplementation(() => {
      throw dbError;
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error while saving context.', details: dbError.message });
  });
});
