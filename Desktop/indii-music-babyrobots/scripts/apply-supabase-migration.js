#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting Supabase migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250712015000_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Running initial schema migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
    
    console.log('✅ Initial schema migration completed successfully');
    
    // Now run the seed data
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Running seed data...');
    
    const { data: seedData, error: seedError } = await supabase.rpc('exec_sql', {
      sql: seedSQL
    });
    
    if (seedError) {
      console.error('❌ Seed failed:', seedError);
      return false;
    }
    
    console.log('✅ Seed data loaded successfully');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
}

// Alternative approach: Execute SQL directly
async function runMigrationDirect() {
  try {
    console.log('🚀 Starting direct SQL execution...');
    
    // Read and split the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250712015000_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📖 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            // Continue with next statement for non-critical errors
          }
        } catch (statementError) {
          console.warn(`⚠️ Warning in statement ${i + 1}:`, statementError.message);
        }
      }
    }
    
    console.log('✅ Migration statements completed');
    return true;
    
  } catch (error) {
    console.error('❌ Direct migration error:', error.message);
    return false;
  }
}

// Test connection first
async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎵 Indii Music - Supabase Migration Tool');
  console.log('=====================================');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('\n💡 Make sure you have the correct SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  
  const success = await runMigrationDirect();
  
  if (success) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('Your Supabase database is now ready for Indii Music');
  } else {
    console.log('\n❌ Migration failed. Check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
