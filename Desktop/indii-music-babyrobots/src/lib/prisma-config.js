import { PrismaClient } from '@prisma/client';

// Global Prisma instance management
let prisma = null;

// Configuration options based on environment
const getPrismaConfig = () => {
  const config = {
    log: ['error', 'warn'],
    errorFormat: 'minimal',
  };

  // Add detailed logging in development
  if (process.env.NODE_ENV === 'development') {
    config.log = ['query', 'error', 'warn', 'info'];
    config.errorFormat = 'pretty';
  }

  // Add connection pool settings for production
  if (process.env.NODE_ENV === 'production') {
    config.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    };
  }

  return config;
};

// Create or get Prisma client instance
export const getPrismaClient = () => {
  if (!prisma) {
    try {
      prisma = new PrismaClient(getPrismaConfig());
      console.log('✅ Prisma client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Prisma client:', error.message);
      throw error;
    }
  }
  return prisma;
};

// Database connection testing
export const testPrismaConnection = async () => {
  try {
    const client = getPrismaClient();
    
    // Test basic connection
    await client.$connect();
    console.log('✅ Prisma database connection successful');
    
    // Test query execution
    const result = await client.$queryRaw`SELECT 1 as test`;
    console.log('✅ Prisma query execution successful');
    
    return {
      connected: true,
      message: 'Prisma connection and query test successful',
      result
    };
  } catch (error) {
    console.error('❌ Prisma connection test failed:', error.message);
    return {
      connected: false,
      error: error.message,
      code: error.code
    };
  }
};

// Check database schema status
export const checkSchemaStatus = async () => {
  try {
    const client = getPrismaClient();
    
    // Check if main tables exist
    const tables = await client.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tableNames = tables.map(table => table.table_name);
    
    // Expected core tables
    const expectedTables = [
      'users',
      'artist_profiles',
      'fan_profiles',
      'licensor_profiles',
      'service_provider_profiles',
      'accounts',
      'sessions',
      'user_roles',
      'security_logs'
    ];
    
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    const extraTables = tableNames.filter(table => !expectedTables.includes(table));
    
    return {
      tablesExist: tableNames.length > 0,
      tableCount: tableNames.length,
      existingTables: tableNames,
      missingTables,
      extraTables,
      needsMigration: missingTables.length > 0,
      isComplete: missingTables.length === 0
    };
    
  } catch (error) {
    console.error('❌ Schema status check failed:', error.message);
    return {
      error: error.message,
      tablesExist: false,
      needsMigration: true
    };
  }
};

// Run pending migrations
export const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Note: In production, you'd typically run this via CLI: npx prisma migrate deploy
    // For development, we can check migration status
    const client = getPrismaClient();
    
    // Check if _prisma_migrations table exists
    const migrationTableExists = await client.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `;
    
    if (!migrationTableExists[0]?.exists) {
      return {
        success: false,
        message: 'Migration table does not exist. Please run: npx prisma migrate dev',
        needsManualMigration: true
      };
    }
    
    // Get migration status
    const migrations = await client.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count 
      FROM "_prisma_migrations" 
      ORDER BY started_at DESC 
      LIMIT 10;
    `;
    
    return {
      success: true,
      message: 'Migration status retrieved',
      migrations,
      lastMigration: migrations[0] || null
    };
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    return {
      success: false,
      error: error.message,
      needsManualMigration: true
    };
  }
};

// Database health check (comprehensive)
export const performHealthCheck = async () => {
  console.log('🏥 Performing comprehensive database health check...');
  
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    checks: {}
  };
  
  try {
    // 1. Connection test
    console.log('  📡 Testing connection...');
    results.checks.connection = await testPrismaConnection();
    
    // 2. Schema status
    console.log('  📋 Checking schema status...');
    results.checks.schema = await checkSchemaStatus();
    
    // 3. Migration status
    console.log('  🔄 Checking migration status...');
    results.checks.migrations = await runMigrations();
    
    // 4. Performance test (simple query timing)
    console.log('  ⚡ Testing query performance...');
    const start = Date.now();
    await getPrismaClient().$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables`;
    const duration = Date.now() - start;
    
    results.checks.performance = {
      queryTime: duration,
      status: duration < 1000 ? 'good' : duration < 3000 ? 'acceptable' : 'slow'
    };
    
    // Overall assessment
    const connectionOk = results.checks.connection.connected;
    const schemaOk = results.checks.schema.tablesExist;
    const performanceOk = results.checks.performance.status !== 'slow';
    
    if (connectionOk && schemaOk && performanceOk) {
      results.overall = 'healthy';
    } else if (connectionOk && schemaOk) {
      results.overall = 'functional';
    } else if (connectionOk) {
      results.overall = 'needs_setup';
    } else {
      results.overall = 'unhealthy';
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    results.overall = 'error';
    results.error = error.message;
  }
  
  console.log(`✅ Health check complete. Overall status: ${results.overall}`);
  return results;
};

// Graceful shutdown
export const disconnectPrisma = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log('✅ Prisma disconnected gracefully');
    } catch (error) {
      console.error('❌ Error disconnecting Prisma:', error.message);
    } finally {
      prisma = null;
    }
  }
};

// Development utilities
export const resetDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database reset only allowed in development mode');
  }
  
  try {
    console.log('🗑️ Resetting development database...');
    const client = getPrismaClient();
    
    // This would typically be: npx prisma migrate reset --force
    console.log('⚠️ Please run: npx prisma migrate reset --force');
    
    return {
      success: false,
      message: 'Manual reset required. Run: npx prisma migrate reset --force'
    };
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    throw error;
  }
};

// Seed database with initial data
export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with initial data...');
    const client = getPrismaClient();
    
    // Check if data already exists
    const userCount = await client.user.count();
    
    if (userCount > 0) {
      return {
        success: true,
        message: `Database already has ${userCount} users, skipping seed`,
        skipped: true
      };
    }
    
    // Add initial test data if needed
    // This would typically be in a separate seed file
    
    return {
      success: true,
      message: 'Database seeding complete',
      created: 0
    };
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
};

export default {
  client: getPrismaClient,
  test: testPrismaConnection,
  health: performHealthCheck,
  schema: checkSchemaStatus,
  migrate: runMigrations,
  seed: seedDatabase,
  reset: resetDatabase,
  disconnect: disconnectPrisma
};
