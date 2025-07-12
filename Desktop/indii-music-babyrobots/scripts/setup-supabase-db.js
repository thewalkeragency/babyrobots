#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const connectionString = "postgresql://postgres.nfxaakyxweukyfsjuhhw:Memex2025!@aws-0-us-east-2.pooler.supabase.com:6543/postgres";

async function setupDatabase() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the schema migration file
    const schemaPath = path.join(__dirname, '../supabase/migrations/20250712015000_initial_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Running database schema migration...');
    await client.query(schemaSQL);
    console.log('✅ Schema migration completed successfully!');

    // Read and run the seed data
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Loading seed data...');
    await client.query(seedSQL);
    console.log('✅ Seed data loaded successfully!');

    // Verify the setup by checking tables
    console.log('🔍 Verifying database setup...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });

    // Check roles
    const rolesResult = await client.query('SELECT name, display_name FROM roles ORDER BY level DESC;');
    console.log('\n👥 Created roles:');
    rolesResult.rows.forEach(row => {
      console.log(`  • ${row.name} - ${row.display_name}`);
    });

    // Check admin user
    const adminResult = await client.query('SELECT email, username FROM users WHERE email = $1;', ['admin@indii.music']);
    if (adminResult.rows.length > 0) {
      console.log('\n👤 Admin user created:');
      console.log(`  • Email: ${adminResult.rows[0].email}`);
      console.log(`  • Username: ${adminResult.rows[0].username}`);
      console.log('  • Password: admin123 (change this immediately!)');
    }

    console.log('\n🎉 Indii Music database setup completed successfully!');
    console.log('🚀 Your Supabase database is now ready for the Indii Music platform.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('💡 Some tables may already exist. This is normal if you\'ve run this script before.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Test connection first
async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🧪 Testing database connection...');
    await client.connect();
    
    const result = await client.query('SELECT version();');
    console.log('✅ Connection successful!');
    console.log(`📋 PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

// Main execution
async function main() {
  console.log('🎵 Indii Music - Supabase Database Setup');
  console.log('==========================================');
  
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  await setupDatabase();
}

main().catch(console.error);
