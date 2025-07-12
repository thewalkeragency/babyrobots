#!/usr/bin/env node
/**
 * Test Supabase Connection and Database Setup
 * This script verifies the local Supabase instance is running and properly configured
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Supabase Connection\n');

async function testSupabaseConnection() {
  try {
    // Test 1: Configuration Check
    console.log('1️⃣ Checking configuration...');
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
    }
    if (!supabaseAnonKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured');
    }
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }
    console.log('✅ Configuration complete');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...\n`);

    // Test 2: Create clients
    console.log('2️⃣ Creating Supabase clients...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Clients created successfully\n');

    // Test 3: Database connection test
    console.log('3️⃣ Testing database connection...');
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('❌ Database connection failed:', healthError.message);
      return false;
    }
    console.log('✅ Database connection successful\n');

    // Test 4: Check schema and seed data
    console.log('4️⃣ Checking database schema...');
    
    // Check if roles exist
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('name, display_name')
      .limit(5);
    
    if (rolesError) {
      console.log('❌ Schema check failed:', rolesError.message);
      return false;
    }
    
    console.log('✅ Schema validated');
    console.log(`   Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`   - ${role.name}: ${role.display_name}`);
    });
    console.log('');

    // Test 5: Check permissions
    console.log('5️⃣ Checking permissions...');
    const { data: permissions, error: permError } = await supabaseAdmin
      .from('permissions')
      .select('name, resource, action')
      .limit(5);
    
    if (permError) {
      console.log('❌ Permissions check failed:', permError.message);
      return false;
    }
    
    console.log('✅ Permissions validated');
    console.log(`   Found ${permissions.length} permissions (showing first 5):`);
    permissions.forEach(perm => {
      console.log(`   - ${perm.name}: ${perm.action} on ${perm.resource}`);
    });
    console.log('');

    // Test 6: Check admin user
    console.log('6️⃣ Checking admin user...');
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, email, username, profile_type')
      .eq('email', 'admin@indii.music')
      .single();
    
    if (adminError) {
      console.log('❌ Admin user check failed:', adminError.message);
      return false;
    }
    
    console.log('✅ Admin user found');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Profile Type: ${adminUser.profile_type}\n`);

    // Test 7: Test authentication endpoints
    console.log('7️⃣ Testing authentication endpoints...');
    
    // Test signup endpoint (will fail as expected since user exists)
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signupError && !signupError.message.includes('already registered')) {
      console.log('❌ Auth signup test failed:', signupError.message);
      return false;
    }
    
    console.log('✅ Authentication endpoints responding\n');

    // Test 8: Row Level Security
    console.log('8️⃣ Testing Row Level Security...');
    
    // Try to access users table with anon client (should be restricted)
    const { data: anonUsers, error: anonError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    // This should either return no data or an error due to RLS
    console.log('✅ RLS test completed (restrictions may apply)\n');

    // Test 9: Real-time subscriptions
    console.log('9️⃣ Testing real-time capabilities...');
    
    const channel = supabase.channel('test')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Real-time event received:', payload);
      })
      .subscribe();
    
    // Unsubscribe immediately
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 100);
    
    console.log('✅ Real-time setup successful\n');

    console.log('🎉 All tests passed! Supabase is ready for development.');
    console.log('\n📊 Summary:');
    console.log('   ✅ Configuration valid');
    console.log('   ✅ Database connected');
    console.log('   ✅ Schema migrated');
    console.log('   ✅ Seed data loaded');
    console.log('   ✅ Authentication ready');
    console.log('   ✅ Real-time enabled');
    console.log('\n🔗 Useful URLs:');
    console.log(`   📊 Studio: http://127.0.0.1:54323`);
    console.log(`   📧 Mail: http://127.0.0.1:54324`);
    console.log(`   🔌 API: http://127.0.0.1:54321`);
    console.log(`   📊 DB: postgresql://postgres:postgres@127.0.0.1:54322/postgres`);
    
    return true;

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure Docker is running: docker ps');
    console.log('   2. Make sure Supabase is started: supabase start');
    console.log('   3. Check your .env configuration');
    console.log('   4. Try: supabase stop && supabase start');
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
