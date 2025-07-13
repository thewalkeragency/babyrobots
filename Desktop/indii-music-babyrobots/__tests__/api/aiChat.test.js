import handler from '../../pages/api/ai/chat';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';

// Store original process.cwd to restore it
const originalProcessCwd = process.cwd;

// Mock the underlying lib/db that db-adapter uses
jest.mock('../../src/lib/db', () => {
  const fsActual = jest.requireActual('fs');
  const pathActual = jest.requireActual('path');
  
  // Define paths within the mock to avoid hoisting issues
  const TEST_DB_DIR_CHAT_API = pathActual.join(__dirname, 'test_chat_api_db_data');
  
  if (!fsActual.existsSync(TEST_DB_DIR_CHAT_API)) {
    fsActual.mkdirSync(TEST_DB_DIR_CHAT_API, { recursive: true });
  }

  const originalCwd = process.cwd;
  process.cwd = () => TEST_DB_DIR_CHAT_API;
  const actualDbModule = jest.requireActual('../../src/lib/db');
  process.cwd = originalCwd;

  return actualDbModule;
});

// Ensure db-adapter uses the mocked database
import * as dbAdapter from '../../src/lib/db-adapter';
jest.mock('../../src/lib/db-adapter');

// --- Test Database Setup paths ---
const TEST_DB_DIR_CHAT_API = path.join(__dirname, 'test_chat_api_db_data');
const ACTUAL_DB_PATH_CHAT_API = path.join(TEST_DB_DIR_CHAT_API, 'indii-music.db'); // Use the standard filename

import { db, createUser, createChatSession, getChatHistory, getChatSession as getChatSessionForTest } from '../../src/lib/db';


// --- AI Service Mock ---
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn();
const mockGetGenerativeModel = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

// Helper to create mock req/res objects
const mockReqRes = (method, body) => {
  const req = { method, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return { req, res };
};


describe('AI Chat API (/pages/api/ai/chat.js)', () => {
  let testUserId;

  beforeAll(() => {
    expect(db.name).toBe(ACTUAL_DB_PATH_CHAT_API);
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(ACTUAL_DB_PATH_CHAT_API)) {
      fs.unlinkSync(ACTUAL_DB_PATH_CHAT_API);
    }
    if (fs.existsSync(TEST_DB_DIR_CHAT_API) && fs.readdirSync(TEST_DB_DIR_CHAT_API).length === 0) {
      fs.rmdirSync(TEST_DB_DIR_CHAT_API);
    }
  });

  beforeEach(() => {
    mockSendMessage.mockReset();
    mockStartChat.mockReset();
    mockGetGenerativeModel.mockReset();

    mockGetGenerativeModel.mockReturnValue({ startChat: mockStartChat });
    mockStartChat.mockReturnValue({ sendMessage: mockSendMessage });
    mockSendMessage.mockResolvedValue({
      response: { text: jest.fn().mockReturnValue('Mocked AI response') },
    });

    const tables = ['users', 'chat_sessions', 'chat_messages'];
    tables.forEach(table => {
      try {
        db.exec(`DELETE FROM ${table};`);
        if (table !== 'sqlite_sequence') {
          db.exec(`DELETE FROM sqlite_sequence WHERE name='${table}';`);
        }
      } catch (e) { /* ignore */ }
    });

    const user = createUser({ email: 'chat-api-user@example.com', password_hash: 'hash', username: 'chatapiuser', profile_type: 'artist' });
    testUserId = user.lastInsertRowid;

    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should return a successful AI response and NOT save to DB if sessionId is not provided', async () => {
    const { req, res } = mockReqRes('POST', { message: 'Hello AI', history: [] });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reply: 'Mocked AI response' });
    expect(mockSendMessage).toHaveBeenCalledWith('Hello AI');

    const mockSessionIdForQuery = "non-existent-session-for-no-save-test";
    const history = getChatHistory(mockSessionIdForQuery);
    expect(history.length).toBe(0);
  });

  it('should save chat message to DB if valid sessionId is provided', async () => {
    const sessionId = 'save-this-chat-session';
    const userMessage = 'Test message for saving';
    const aiReply = faker.lorem.sentence();
    // Ensure the mock for this specific call returns the desired AI reply
    mockSendMessage.mockResolvedValueOnce({ response: { text: () => aiReply } });

    createChatSession({ user_id: testUserId, session_id: sessionId, role: 'test_role' });

    const { req, res } = mockReqRes('POST', { message: userMessage, history: [], sessionId: sessionId });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reply: aiReply });

    const savedMessages = getChatHistory(sessionId);
    expect(savedMessages.length).toBe(1);
    expect(savedMessages[0].message).toBe(userMessage);
    expect(savedMessages[0].response).toBe(aiReply);
    expect(savedMessages[0].role).toBe('test_role');
  });

  it('should NOT save chat message to DB if invalid sessionId is provided (session does not exist)', async () => {
    const sessionId = 'invalid-session-for-saving';
    const userMessage = 'Another test message';

    const { req, res } = mockReqRes('POST', { message: userMessage, history: [], sessionId: sessionId });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reply: 'Mocked AI response' });

    const sessionInDb = getChatSessionForTest(sessionId);
    expect(sessionInDb).toBeNull();

    const savedMessages = getChatHistory(sessionId);
    expect(savedMessages.length).toBe(0);
  });

  it('should call AI with history if provided', async () => {
    const history = [
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello' }] },
    ];
    const { req, res } = mockReqRes('POST', { message: 'Hello AI again', history: history });
    await handler(req, res);

    expect(mockStartChat).toHaveBeenCalledWith({
      history: history,
      generationConfig: { maxOutputTokens: 100 },
    });
    expect(mockSendMessage).toHaveBeenCalledWith('Hello AI again');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if message is missing', async () => {
    const { req, res } = mockReqRes('POST', {}); // No message
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Message is required.' });
  });

  it('should return 500 if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const { req, res } = mockReqRes('POST', { message: 'Hello AI' });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Google Gemini API key not configured.' });
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = mockReqRes('GET', {});
    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith(`Method GET Not Allowed`);
  });
});