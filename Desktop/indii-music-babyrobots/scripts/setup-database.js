#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps set up the database environment for the INDII Music platform.
 * It can configure Prisma, run migrations, and verify the database setup.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`)
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(`${colors.magenta}?${colors.reset} ${prompt} `, resolve);
  });
};

// Check if a command exists
const commandExists = (command) => {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Run command with error handling
const runCommand = (command, description) => {
  log.step(`${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log.success(`${description} completed`);
    return { success: true, output };
  } catch (error) {
    log.error(`${description} failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Check environment setup
const checkEnvironment = () => {
  log.step('Checking environment...');
  
  const checks = {
    node: commandExists('node'),
    npm: commandExists('npm'),
    prisma: commandExists('npx prisma'),
    envFile: fs.existsSync('.env'),
    prismaSchema: fs.existsSync('prisma/schema.prisma')
  };
  
  if (checks.node) log.success('Node.js is installed');
  else log.error('Node.js is not installed');
  
  if (checks.npm) log.success('npm is available');
  else log.error('npm is not available');
  
  if (checks.prisma) log.success('Prisma CLI is available');
  else log.warn('Prisma CLI not found, will try to install');
  
  if (checks.envFile) log.success('.env file exists');
  else log.warn('.env file not found');
  
  if (checks.prismaSchema) log.success('Prisma schema exists');
  else log.error('Prisma schema not found');
  
  return checks;
};

// Read and parse .env file
const readEnvFile = () => {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').replace(/"/g, '').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    log.warn('Could not read .env file');
    return {};
  }
};

// Update .env file
const updateEnvFile = (updates) => {
  try {
    let envContent = '';
    
    if (fs.existsSync('.env')) {
      envContent = fs.readFileSync('.env', 'utf8');
    }
    
    // Add or update variables
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}="${value}"`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });
    
    fs.writeFileSync('.env', envContent.trim() + '\n');
    log.success('Updated .env file');
  } catch (error) {
    log.error(`Failed to update .env file: ${error.message}`);
  }
};

// Setup database URL
const setupDatabaseUrl = async () => {
  log.step('Setting up database configuration...');
  
  const envVars = readEnvFile();
  
  if (envVars.DATABASE_URL && !envVars.DATABASE_URL.includes('localhost:5432')) {
    log.info('DATABASE_URL already configured');
    return envVars.DATABASE_URL;
  }
  
  console.log('\nDatabase setup options:');
  console.log('1. Use local PostgreSQL');
  console.log('2. Use Supabase');
  console.log('3. Skip (use SQLite for now)');
  
  const choice = await question('Choose option (1-3): ');
  
  switch (choice) {
    case '1':
      return await setupLocalPostgreSQL();
    case '2':
      return await setupSupabase();
    case '3':
      log.info('Skipping database setup, using SQLite');
      return null;
    default:
      log.warn('Invalid choice, using SQLite');
      return null;
  }
};

// Setup local PostgreSQL
const setupLocalPostgreSQL = async () => {
  log.step('Setting up local PostgreSQL...');
  
  const dbName = await question('Database name (default: indii_music_dev): ') || 'indii_music_dev';
  const username = await question('Username (default: postgres): ') || 'postgres';
  const password = await question('Password: ');
  const host = await question('Host (default: localhost): ') || 'localhost';
  const port = await question('Port (default: 5432): ') || '5432';
  
  const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${dbName}?schema=public`;
  
  updateEnvFile({
    DATABASE_URL: databaseUrl,
    USE_PRISMA: 'true'
  });
  
  log.success('Local PostgreSQL configuration saved');
  return databaseUrl;
};

// Setup Supabase
const setupSupabase = async () => {
  log.step('Setting up Supabase...');
  
  console.log('\nPlease provide your Supabase credentials:');
  console.log('You can find these in your Supabase project settings > API');
  
  const projectUrl = await question('Project URL (https://xxx.supabase.co): ');
  const anonKey = await question('Anon key: ');
  const serviceKey = await question('Service role key: ');
  
  // Extract database URL from project URL
  const projectId = projectUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
  if (!projectId) {
    log.error('Invalid Supabase URL format');
    return null;
  }
  
  const dbPassword = await question('Database password: ');
  const databaseUrl = `postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;
  
  updateEnvFile({
    DATABASE_URL: databaseUrl,
    NEXT_PUBLIC_SUPABASE_URL: projectUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    USE_PRISMA: 'true'
  });
  
  log.success('Supabase configuration saved');
  return databaseUrl;
};

// Test database connection
const testConnection = async () => {
  log.step('Testing database connection...');
  
  try {
    // Import our database utilities
    const { testPrismaConnection } = require('../src/lib/prisma-config.js');
    const result = await testPrismaConnection();
    
    if (result.connected) {
      log.success('Database connection successful');
      return true;
    } else {
      log.error(`Database connection failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    log.error(`Connection test failed: ${error.message}`);
    return false;
  }
};

// Run Prisma migrations
const runMigrations = async () => {
  log.step('Running Prisma migrations...');
  
  // Generate Prisma client first
  const generateResult = runCommand('npx prisma generate', 'Generating Prisma client');
  if (!generateResult.success) {
    return false;
  }
  
  // Run migrations
  const migrateResult = runCommand('npx prisma migrate dev --name init', 'Running migrations');
  if (!migrateResult.success) {
    // Try reset if initial migration fails
    log.warn('Initial migration failed, trying reset...');
    const resetResult = runCommand('npx prisma migrate reset --force', 'Resetting database');
    if (resetResult.success) {
      return runCommand('npx prisma migrate dev --name init', 'Running migrations after reset').success;
    }
    return false;
  }
  
  return true;
};

// Seed database with initial data
const seedDatabase = async () => {
  const shouldSeed = await question('Would you like to seed the database with initial data? (y/N): ');
  
  if (shouldSeed.toLowerCase() === 'y' || shouldSeed.toLowerCase() === 'yes') {
    log.step('Seeding database...');
    
    try {
      const { seedDatabase } = require('../src/lib/prisma-config.js');
      const result = await seedDatabase();
      
      if (result.success) {
        log.success(result.message);
      } else {
        log.warn(result.message);
      }
      
      return true;
    } catch (error) {
      log.error(`Seeding failed: ${error.message}`);
      return false;
    }
  }
  
  return true;
};

// Main setup function
const main = async () => {
  console.log(`${colors.magenta}🎵 INDII Music Database Setup${colors.reset}\n`);
  
  try {
    // Check environment
    const checks = checkEnvironment();
    
    if (!checks.node || !checks.npm) {
      log.error('Missing required dependencies. Please install Node.js and npm first.');
      process.exit(1);
    }
    
    if (!checks.prismaSchema) {
      log.error('Prisma schema not found. Please ensure you are in the project root directory.');
      process.exit(1);
    }
    
    // Install Prisma CLI if needed
    if (!checks.prisma) {
      const installPrisma = await question('Install Prisma CLI? (Y/n): ');
      if (installPrisma.toLowerCase() !== 'n') {
        runCommand('npm install -g prisma', 'Installing Prisma CLI');
      }
    }
    
    // Setup database URL
    const databaseUrl = await setupDatabaseUrl();
    
    if (databaseUrl) {
      // Test connection
      const connected = await testConnection();
      
      if (connected) {
        // Run migrations
        const migrated = await runMigrations();
        
        if (migrated) {
          // Seed database
          await seedDatabase();
          
          log.success('Database setup complete!');
          console.log('\nNext steps:');
          console.log('1. Start your development server: npm run dev');
          console.log('2. Visit http://localhost:9000/api/db/status to check database status');
          console.log('3. Begin developing your application');
        } else {
          log.error('Migration failed. Please check your database configuration.');
        }
      } else {
        log.error('Could not connect to database. Please check your configuration.');
      }
    } else {
      log.info('Database setup skipped. Using SQLite for development.');
      log.info('You can run this script again later to configure PostgreSQL/Supabase.');
    }
    
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkEnvironment,
  setupDatabaseUrl,
  testConnection,
  runMigrations,
  seedDatabase
};
