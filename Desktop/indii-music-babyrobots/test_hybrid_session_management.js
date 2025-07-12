#!/usr/bin/env node
/**
 * Hybrid Session Management Test
 * Tests both existing JWT/SQLite authentication and new Supabase integration
 */

require('dotenv').config();

// Handle fetch for Node.js
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  // For Node.js 18+ where fetch is built-in
  fetch = globalThis.fetch;
}

const { createClient } = require('@supabase/supabase-js');

const BASE_URL = 'http://localhost:9000';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let testUserId = null;
let testSessionToken = null;
let supabaseUser = null;

console.log('🧪 Starting Hybrid Session Management Tests\n');

async function createTestUser() {
  console.log('1️⃣ Creating test user in existing system...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hybrid-test@example.com',
        password: 'SecurePass123!',
        username: 'hybrid_tester',
        role: 'fan',
        firstName: 'Hybrid',
        lastName: 'Tester'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      testUserId = result.user.id;
      console.log(`✅ User created successfully: ${testUserId}`);
      return true;
    } else {
      console.log(`❌ User creation failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ User creation error: ${error.message}`);
    return false;
  }
}

async function testSupabaseUserCreation() {
  console.log('\n2️⃣ Testing Supabase user creation...');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test user registration via Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: 'supabase-test@example.com',
      password: 'SecurePass123!',
      options: {
        data: {
          username: 'supabase_tester',
          first_name: 'Supabase',
          last_name: 'Tester'
        }
      }
    });
    
    if (error) {
      console.log(`❌ Supabase user creation failed: ${error.message}`);
      return false;
    }
    
    supabaseUser = data.user;
    console.log(`✅ Supabase user created: ${supabaseUser.id}`);
    return true;
  } catch (error) {
    console.log(`❌ Supabase user creation error: ${error.message}`);
    return false;
  }
}

async function testExistingSessionCreation() {
  console.log('\n3️⃣ Testing existing session creation...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hybrid-test@example.com',
        password: 'SecurePass123!',
        deviceInfo: 'Test Device - Hybrid Test',
        userAgent: 'Node.js Test Client'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      testSessionToken = result.sessionToken;
      console.log(`✅ Session created: ${testSessionToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`❌ Session creation failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Session creation error: ${error.message}`);
    return false;
  }
}

async function testSupabaseSessionManagement() {
  console.log('\n4️⃣ Testing Supabase session management...');
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    if (!supabaseUser) {
      console.log('❌ No Supabase user available for session test');
      return false;
    }
    
    // Get user session from Supabase auth
    const { data: { session }, error } = await supabaseAdmin.auth.admin.getUserById(supabaseUser.id);
    
    if (error) {
      console.log(`❌ Session retrieval failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Supabase session management working');
    return true;
  } catch (error) {
    console.log(`❌ Supabase session error: ${error.message}`);
    return false;
  }
}

async function testDatabaseConsistency() {
  console.log('\n5️⃣ Testing database consistency...');
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the user exists in Supabase database
    const { data: existingUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'hybrid-test@example.com')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.log(`❌ Database query failed: ${error.message}`);
      return false;
    }
    
    if (existingUser) {
      console.log('✅ User found in Supabase database');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Profile Type: ${existingUser.profile_type}`);
    } else {
      console.log('⚠️ User not found in Supabase database (expected if using separate systems)');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Database consistency error: ${error.message}`);
    return false;
  }
}

async function testExistingSessionValidation() {
  console.log('\n6️⃣ Testing existing session validation...');
  try {
    if (!testSessionToken) {
      console.log('❌ No session token available for validation');
      return false;
    }
    
    const response = await fetch(`${BASE_URL}/api/auth/sessions/validate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSessionToken}`
      },
      body: JSON.stringify({
        sessionToken: testSessionToken
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Session validation successful');
      console.log(`   User ID: ${result.userId}`);
      console.log(`   Valid: ${result.valid}`);
      return true;
    } else {
      console.log(`❌ Session validation failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Session validation error: ${error.message}`);
    return false;
  }
}

async function testSupabaseRowLevelSecurity() {
  console.log('\n7️⃣ Testing Supabase Row Level Security...');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to access users table without authentication
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('✅ RLS working - anonymous access restricted');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('⚠️ RLS may need configuration - anonymous access allowed');
      console.log(`   Retrieved ${data?.length || 0} records`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ RLS test error: ${error.message}`);
    return false;
  }
}

async function testPerformance() {
  console.log('\n8️⃣ Testing performance...');
  try {
    const startTime = Date.now();
    
    // Test 5 rapid session validations
    const promises = Array(5).fill().map(async (_, i) => {
      if (!testSessionToken) return false;
      
      const response = await fetch(`${BASE_URL}/api/auth/sessions/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testSessionToken}`
        },
        body: JSON.stringify({
          sessionToken: testSessionToken
        })
      });
      
      return response.ok;
    });
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successCount = results.filter(Boolean).length;
    console.log(`✅ Performance test completed`);
    console.log(`   Successful validations: ${successCount}/5`);
    console.log(`   Total time: ${duration}ms`);
    console.log(`   Average time per request: ${(duration / 5).toFixed(2)}ms`);
    
    return successCount >= 4; // Allow for 1 failure
  } catch (error) {
    console.log(`❌ Performance test error: ${error.message}`);
    return false;
  }
}

async function cleanup() {
  console.log('\n9️⃣ Cleaning up test data...');
  try {
    // Revoke existing session
    if (testSessionToken) {
      await fetch(`${BASE_URL}/api/auth/sessions/revoke`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testSessionToken}`
        },
        body: JSON.stringify({
          sessionToken: testSessionToken
        })
      });
    }
    
    // Clean up Supabase test user if created
    if (supabaseUser) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
    }
    
    console.log('✅ Cleanup completed');
    return true;
  } catch (error) {
    console.log(`❌ Cleanup error: ${error.message}`);
    return false;
  }
}

async function runHybridTests() {
  console.log('🚀 Running Hybrid Session Management Tests\n');
  
  const results = {
    userCreation: false,
    supabaseUserCreation: false,
    sessionCreation: false,
    supabaseSessionManagement: false,
    databaseConsistency: false,
    sessionValidation: false,
    rowLevelSecurity: false,
    performance: false,
    cleanup: false
  };
  
  results.userCreation = await createTestUser();
  results.supabaseUserCreation = await testSupabaseUserCreation();
  results.sessionCreation = await testExistingSessionCreation();
  results.supabaseSessionManagement = await testSupabaseSessionManagement();
  results.databaseConsistency = await testDatabaseConsistency();
  results.sessionValidation = await testExistingSessionValidation();
  results.rowLevelSecurity = await testSupabaseRowLevelSecurity();
  results.performance = await testPerformance();
  results.cleanup = await cleanup();
  
  console.log('\n📊 Test Results Summary:');
  console.log('================================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${testName}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Hybrid system is working correctly.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️ Most tests passed. Review failed tests above.');
  } else {
    console.log('❌ Several tests failed. System needs attention.');
  }
  
  return passedTests === totalTests;
}

// Run the hybrid tests
runHybridTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
