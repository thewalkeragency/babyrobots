import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'web-streams-polyfill'; // Import the web-streams-polyfill
import { TextEncoder, TextDecoder } from 'util';

// Use built-in Node.js TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Mock the performance object for Next.js API route testing
global.performance = {
  getEntriesByName: () => [],
  mark: () => {},
  measure: () => {},
  clearMarks: () => {},
  clearMeasures: () => {},
};

// Mock window.confirm globally
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: () => true,
});

// Mock fetch globally for all tests
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }),
});

// Simplified mocks - specific mocks should be in individual test files
