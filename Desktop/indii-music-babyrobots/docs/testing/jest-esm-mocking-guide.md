# Jest ESM Mocking Guide

## Overview
This guide documents solutions for common Jest mocking issues when working with ES modules (ESM) in Next.js projects, particularly for authentication services and API testing.

## Problem: ESM Module Mocking with Mixed Export Types

### Scenario
When you have a module that exports both named and default exports:

```javascript
// src/lib/auth-service.js
export class AuthService {
  async validateSession(req) { /* ... */ }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;  // Same instance as default
```

And your API handlers import as default:

```javascript
// pages/api/roles/assign.js
import authService from '../../../src/lib/auth-service.js';

export default async function handler(req, res) {
  const authResult = await authService.validateSession(req);
  // ...
}
```

### Common Error
```
TypeError: Cannot read properties of undefined (reading 'validateSession')
- authService.validateSession is not a function
```

### Root Cause
Jest mocks that try to handle both export types incorrectly:

```javascript
// ❌ WRONG - Overly complex mock structure
jest.mock('../../src/lib/auth-service.js', () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
  authService: mockAuthService,
  default: mockAuthService
}));
```

### Solution
Use simple default export mocking when handlers only use default imports:

```javascript
// ✅ CORRECT - Simple default export mock
const mockAuthService = {
  validateSession: jest.fn()
};

jest.mock('../../src/lib/auth-service.js', () => mockAuthService);
```

## Jest Configuration for ESM Support

### package.json
```json
{
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest"
  },
  "type": "module"
}
```

### jest.config.js
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      useESM: true
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@supabase|isows))'
  ]
};
```

### jest.setup.js
```javascript
import { jest } from '@jest/globals';

// Mock problematic ESM dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn()
    }
  }))
}));

jest.mock('isows', () => ({
  WebSocket: jest.fn()
}));
```

## Best Practices

### 1. Match Import Style in Mocks
If your code uses default imports, mock the default export:
```javascript
// Code uses: import authService from './auth-service.js'
jest.mock('./auth-service.js', () => mockService);
```

If your code uses named imports, mock named exports:
```javascript
// Code uses: import { authService } from './auth-service.js'  
jest.mock('./auth-service.js', () => ({
  authService: mockService
}));
```

### 2. Use Dynamic Imports for Complex Scenarios
```javascript
describe('API Tests', () => {
  let handler;
  
  beforeAll(async () => {
    // Import after mocks are set up
    const module = await import('../../pages/api/example.js');
    handler = module.default;
  });
});
```

### 3. Clear Mocks Between Tests
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 4. Validate Mock Functions
```javascript
test('should call service correctly', async () => {
  mockAuthService.validateSession.mockResolvedValue({
    success: true,
    user: { id: 123 }
  });
  
  await handler(req, res);
  
  expect(mockAuthService.validateSession).toHaveBeenCalledWith(req);
  expect(mockAuthService.validateSession).toHaveBeenCalledTimes(1);
});
```

## Troubleshooting Common Issues

### Issue: "Cannot find module" with ESM
**Solution**: Add to `transformIgnorePatterns` in jest.config.js:
```javascript
transformIgnorePatterns: [
  'node_modules/(?!(problematic-esm-package|another-package))'
]
```

### Issue: Top-level await errors
**Solution**: Enable experimental VM modules:
```bash
NODE_OPTIONS=--experimental-vm-modules npm test
```

### Issue: Supabase/isows import errors
**Solution**: Mock in jest.setup.js as shown above.

### Issue: Mock not being applied
**Solution**: 
1. Ensure mock is declared before imports
2. Use `jest.doMock()` for conditional mocking
3. Check file path accuracy in mock declaration

## Example: Complete RBAC API Test

```javascript
import { jest } from '@jest/globals';

// Mock services BEFORE any imports
const mockAuthService = {
  validateSession: jest.fn()
};

const mockRbacService = {
  assignRole: jest.fn(),
  hasPermission: jest.fn()
};

jest.mock('../../src/lib/auth-service.js', () => mockAuthService);
jest.mock('../../src/lib/rbac-service.js', () => mockRbacService);

describe('RBAC API Tests', () => {
  let assignHandler;
  
  beforeAll(async () => {
    const module = await import('../../pages/api/roles/assign.js');
    assignHandler = module.default;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should assign role successfully', async () => {
    mockAuthService.validateSession.mockResolvedValue({
      success: true,
      user: { id: 456 }
    });
    mockRbacService.hasPermission.mockResolvedValue(true);
    mockRbacService.assignRole.mockResolvedValue({
      id: 1,
      userId: 123,
      role: { name: 'artist' }
    });
    
    const req = { method: 'POST', body: { userId: 123, roleName: 'artist' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await assignHandler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockRbacService.assignRole).toHaveBeenCalledWith(123, 'artist', 456);
  });
});
```

## Related Issues Fixed
- ✅ `validateSession is not a function` errors
- ✅ ESM import/export mocking complexity  
- ✅ Supabase and isows dependency conflicts
- ✅ Top-level await syntax errors
- ✅ Module transformation for Jest

---

*Last updated: 2025-01-11*
*Related files: `__tests__/api/rbac.test.js`, `jest.config.js`, `jest.setup.js`*
