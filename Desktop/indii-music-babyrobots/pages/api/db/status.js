import { isDatabaseConnected, getDatabaseType } from '../../../src/lib/db-adapter';

// Dynamic imports for optional database configurations
let prismaConfig, supabaseConfig;
try {
  prismaConfig = require('../../../src/lib/prisma-config.js').default;
} catch (e) {
  console.warn('Prisma config not available');
}

try {
  supabaseConfig = require('../../../src/lib/supabase-config.js').default;
} catch (e) {
  console.warn('Supabase config not available');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const includeDetails = req.query.details === 'true';
    const testType = req.query.test || 'current'; // 'all', 'current', 'prisma', 'supabase'
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        currentDatabase: getDatabaseType(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          USE_PRISMA: process.env.USE_PRISMA,
          HAS_DATABASE_URL: !!process.env.DATABASE_URL,
          HAS_SUPABASE_CONFIG: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          DATABASE_TYPE: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'Local',
        },
        tests: {}
      };

      // Test current active database
      if (testType === 'all' || testType === 'current') {
        try {
          const isConnected = await isDatabaseConnected();
          results.tests.current = {
            type: getDatabaseType(),
            connected: isConnected,
            status: isConnected ? 'healthy' : 'unhealthy',
            message: isConnected 
              ? `✅ Current database (${getDatabaseType()}) is connected`
              : `❌ Current database (${getDatabaseType()}) connection failed`
          };
        } catch (error) {
          results.tests.current = {
            type: getDatabaseType(),
            connected: false,
            status: 'error',
            error: error.message
          };
        }
      }

      // Test Prisma if available and requested
      if ((testType === 'all' || testType === 'prisma') && prismaConfig) {
        try {
          if (process.env.DATABASE_URL) {
            if (includeDetails) {
              results.tests.prisma = await prismaConfig.health();
            } else {
              const connectionTest = await prismaConfig.test();
              results.tests.prisma = {
                type: 'prisma',
                connected: connectionTest.connected,
                status: connectionTest.connected ? 'healthy' : 'unhealthy',
                message: connectionTest.message,
                error: connectionTest.error
              };
            }
          } else {
            results.tests.prisma = {
              type: 'prisma',
              connected: false,
              status: 'not_configured',
              message: 'DATABASE_URL not configured for Prisma'
            };
          }
        } catch (error) {
          results.tests.prisma = {
            type: 'prisma',
            connected: false,
            status: 'error',
            error: error.message
          };
        }
      }

      // Test Supabase if available and requested
      if ((testType === 'all' || testType === 'supabase') && supabaseConfig) {
        try {
          const configValidation = supabaseConfig.config();
          
          if (configValidation.isValid) {
            const connectionTest = await supabaseConfig.checkConnection();
            results.tests.supabase = {
              type: 'supabase',
              connected: connectionTest.connected,
              status: connectionTest.connected ? 'healthy' : 'unhealthy',
              message: connectionTest.message,
              error: connectionTest.error,
              warning: connectionTest.warning,
              needsMigration: connectionTest.needsMigration
            };
          } else {
            results.tests.supabase = {
              type: 'supabase',
              connected: false,
              status: 'not_configured',
              message: 'Supabase environment variables not configured',
              errors: configValidation.errors
            };
          }
        } catch (error) {
          results.tests.supabase = {
            type: 'supabase',
            connected: false,
            status: 'error',
            error: error.message
          };
        }
      }

      // Determine overall status
      const hasHealthyDatabase = Object.values(results.tests).some(
        test => test.connected && test.status === 'healthy'
      );

      const overallStatus = hasHealthyDatabase ? 'healthy' : 'unhealthy';
      const statusCode = hasHealthyDatabase ? 200 : 503;
      
      // Summary for backwards compatibility
      const mainTest = results.tests.current || Object.values(results.tests)[0];
      
      res.status(statusCode).json({
        // Backwards compatible fields
        connected: mainTest?.connected || false,
        type: results.currentDatabase,
        message: mainTest?.message || 'No database tests performed',
        
        // Enhanced data
        status: overallStatus,
        ...results
      });

    } catch (error) {
      console.error('Database status check failed:', error);
      res.status(500).json({
        connected: false,
        type: 'unknown',
        status: 'error',
        message: '❌ Database status check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
