#!/usr/bin/env node

/**
 * Database Initialization Script
 * Creates test users using Prisma ORM for Ring 1 testing
 */

import { UserService } from '../src/lib/user-service.js';

async function initDatabase() {
  console.log('🚀 Initializing database with test users...');
  
  try {
    // Create test users
    const users = await UserService.createTestUsers();
    
    console.log('\n✅ Database initialization complete!');
    console.log(`📊 Created ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.profileType}) - ID: ${user.id}`);
    });

    console.log('\n🔐 Test Credentials:');
    console.log('   Artist: artist@test.com / testpass123');
    console.log('   Fan: fan@test.com / testpass123');
    console.log('   Admin: admin@indii.music / admin123!');
    
    console.log('\n🧪 Ready for Ring 1 Session Testing!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await UserService.disconnect();
  }
}

// Run the initialization
initDatabase().catch(console.error);
