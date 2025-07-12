#!/usr/bin/env node

/**
 * Manual Session Management Test Script
 * Tests all session endpoints with real HTTP requests
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Test user data
const testUser = {
  email: 'session.test@indiimusic.com',
  passwordHash: '',
  username: 'sessiontester',
  firstName: 'Session',
  lastName: 'Tester',
  profileType: 'artist'
};

let testUserId;
let testSessionId;
let testAccessToken;
let testRefreshToken;

async function setupTestUser() {
  console.log('\n🔧 Setting up test user...');
  
  // Clean up existing test user
  await prisma.user.deleteMany({
    where: { email: testUser.email }
  });

  // Hash password
  testUser.passwordHash = await bcrypt.hash('SecureTestPass123!', 12);

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: testUser.email,
      passwordHash: testUser.passwordHash,
      username: testUser.username,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      profileType: testUser.profileType
    }
  });

  testUserId = user.id;
  console.log(`✅ Test user created with ID: ${testUserId}`);
  return user;
}

async function testSessionCreate() {
  console.log('\n🧪 Testing session creation...');
  
  try {
    const response = await fetch('http://localhost:9000/api/sessions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'Test Script/1.0'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'SecureTestPass123!',
        deviceInfo: 'Test Device',
        location: 'Test Location',
        rememberMe: false
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Session created successfully');
      testSessionId = data.session.id;
      testAccessToken = data.tokens.accessToken;
      testRefreshToken = data.tokens.refreshToken;
      console.log(`   Session ID: ${testSessionId}`);
      console.log(`   Access Token: ${testAccessToken.substring(0, 20)}...`);
      return data;
    } else {
      console.log('❌ Session creation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Session creation error:', error.message);
    return null;
  }
}

async function testSessionValidate() {
  console.log('\n🧪 Testing session validation...');
  
  if (!testAccessToken) {
    console.log('❌ No access token available for validation');
    return;
  }

  try {
    const response = await fetch('http://localhost:9000/api/sessions/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'Test Script/1.0'
      },
      body: JSON.stringify({
        accessToken: testAccessToken
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Session validation successful');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
    } else {
      console.log('❌ Session validation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Session validation error:', error.message);
  }
}

async function testSessionList() {
  console.log('\n🧪 Testing session list...');
  
  if (!testAccessToken) {
    console.log('❌ No access token available for session list');
    return;
  }

  try {
    const response = await fetch('http://localhost:9000/api/sessions/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testAccessToken}`,
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'Test Script/1.0'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Session list retrieved successfully');
      console.log(`   Total sessions: ${data.sessions.length}`);
      console.log(`   Current session: ${data.currentSessionId}`);
    } else {
      console.log('❌ Session list failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Session list error:', error.message);
  }
}

async function testTokenRefresh() {
  console.log('\n🧪 Testing token refresh...');
  
  if (!testRefreshToken) {
    console.log('❌ No refresh token available for refresh test');
    return;
  }

  try {
    const response = await fetch('http://localhost:9000/api/sessions/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'Test Script/1.0'
      },
      body: JSON.stringify({
        refreshToken: testRefreshToken
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token refresh successful');
      // Update tokens for subsequent tests
      testAccessToken = data.accessToken;
      testRefreshToken = data.refreshToken;
      console.log(`   New access token: ${testAccessToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Token refresh failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Token refresh error:', error.message);
  }
}

async function testSessionRevoke() {
  console.log('\n🧪 Testing session revocation (all other sessions)...');
  
  if (!testAccessToken) {
    console.log('❌ No access token available for revocation test');
    return;
  }

  try {
    const response = await fetch('http://localhost:9000/api/sessions/revoke', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testAccessToken}`,
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'Test Script/1.0'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Session revocation successful');
      console.log(`   Revoked sessions: ${data.revokedCount}`);
      console.log(`   Current session preserved: ${data.currentSessionId}`);
    } else {
      console.log('❌ Session revocation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Session revocation error:', error.message);
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    if (testUserId) {
      // Clean up sessions first
      await prisma.session.deleteMany({
        where: { userId: testUserId }
      });

      // Clean up refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: testUserId }
      });

      // Clean up security logs
      await prisma.securityLog.deleteMany({
        where: { userId: testUserId }
      });

      // Finally, delete user
      await prisma.user.delete({
        where: { id: testUserId }
      });

      console.log('✅ Test data cleaned up successfully');
    }
  } catch (error) {
    console.log('❌ Cleanup error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function runTests() {
  console.log('🚀 Starting Session Management Manual Tests\n');
  console.log('Make sure the development server is running on http://localhost:9000');

  try {
    // Setup
    await setupTestUser();

    // Test session creation
    const sessionData = await testSessionCreate();
    
    if (sessionData) {
      // Test other endpoints only if session creation succeeded
      await testSessionValidate();
      await testSessionList();
      await testTokenRefresh();
      await testSessionRevoke();
    }

    console.log('\n✅ Session management tests completed');
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  } finally {
    await cleanup();
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:9000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Development server is not running on http://localhost:9000');
    console.log('Please start the server first: npm run dev');
    process.exit(1);
  }
  
  await runTests();
}
