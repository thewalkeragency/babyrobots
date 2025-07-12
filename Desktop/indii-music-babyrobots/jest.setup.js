import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'web-streams-polyfill'; // Import the web-streams-polyfill
import { TextEncoder, TextDecoder } from 'text-encoding';

// Polyfill for TextEncoder and TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Mock the performance object for Next.js API route testing
global.performance = {
  getEntriesByName: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock window.confirm globally
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});

// Mock fetch globally for all tests
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: jest.fn(),
});

// Mock Supabase to prevent ESM loading issues
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

// Mock isows to prevent ESM issues
jest.mock('isows', () => ({
  WebSocket: global.WebSocket || jest.fn(),
}));
