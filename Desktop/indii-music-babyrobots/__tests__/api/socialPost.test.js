import handler from '../../pages/api/social/post';
import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';

// Mock the dependencies
jest.mock('../../src/lib/api-utils', () => ({
  routePostRequest: jest.fn(),
}));

import { routePostRequest } from '../../src/lib/api-utils';

let req;
let res;

beforeEach(() => {
  jest.clearAllMocks();
  req = { method: '', body: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn(),
  };
});

describe('POST /api/social/post', () => {
  it('should generate social media post content', async () => {
    req.method = 'POST';
    req.body = { content: 'Exciting news!', hashtags: ['#new'], platform: 'twitter' };
    
    // Mock the routePostRequest to return expected data
    routePostRequest.mockResolvedValue({
      content: faker.lorem.sentence(),
      hashtags: [faker.llorem.word(), faker.lorem.word(), faker.lorem.word()]
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.any(Object)
    }));
  });

  it('should return 405 for wrong method', async () => {
    req.method = 'GET';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

