import handler from '../../pages/api/ai/chat';

// Mock the GoogleGenerativeAI and model.startChat
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('Mocked AI response'),
          },
        }),
      }),
    }),
  })),
}));

describe('AI Chat API', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      method: 'POST',
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    };

    // Mock process.env.GEMINI_API_KEY
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should return a successful AI response with history', async () => {
    req.body = { 
      message: 'Hello AI',
      history: [
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello' }] },
      ],
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reply: 'Mocked AI response' });
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
    expect(GoogleGenerativeAI.mock.results[0].value.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro' });
    expect(GoogleGenerativeAI.mock.results[0].value.getGenerativeModel.mock.results[0].value.startChat).toHaveBeenCalledWith({
      history: [
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello' }] },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    expect(GoogleGenerativeAI.mock.results[0].value.getGenerativeModel.mock.results[0].value.startChat.mock.results[0].value.sendMessage).toHaveBeenCalledWith('Hello AI');
  });

  it('should return 400 if message is missing', async () => {
    req.body = {}; // Missing message

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Message is required.' });
  });

  it('should return 500 if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY; // Remove API key
    req.body = { message: 'Hello AI' };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Google Gemini API key not configured.' });
  });

  it('should return 405 for non-POST requests', async () => {
    req.method = 'GET';

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
  });
});