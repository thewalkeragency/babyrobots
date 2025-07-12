#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Database connection configuration
const connectionString = "postgresql://postgres.nfxaakyxweukyfsjuhhw:Memex2025!@aws-0-us-east-2.pooler.supabase.com:6543/postgres";

// Create readline interface for secure password input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword(question) {
  return new Promise((resolve) => {
    // Hide password input
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          console.log('\nCancelled');
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasNonalphas) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true, message: 'Password is strong' };
}

async function changeAdminPassword() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔐 Indii Music - Change Admin Password');
    console.log('=====================================\n');

    // Connect to database
    await client.connect();
    console.log('✅ Connected to database\n');

    // Verify admin user exists
    const adminCheck = await client.query('SELECT id, email, username FROM users WHERE email = $1', ['admin@indii.music']);
    
    if (adminCheck.rows.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const adminUser = adminCheck.rows[0];
    console.log(`👤 Found admin user: ${adminUser.email} (ID: ${adminUser.id})\n`);

    // Get new password
    let newPassword, confirmPassword;
    let passwordValid = false;

    while (!passwordValid) {
      newPassword = await askPassword('🔑 Enter new admin password: ');
      
      // Validate password strength
      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        console.log(`❌ ${validation.message}\n`);
        continue;
      }

      confirmPassword = await askPassword('🔑 Confirm new password: ');
      
      if (newPassword !== confirmPassword) {
        console.log('❌ Passwords do not match. Please try again.\n');
        continue;
      }

      passwordValid = true;
    }

    // Hash the new password
    console.log('\n🔒 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in database
    console.log('💾 Updating admin password...');
    const updateResult = await client.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING email, updated_at',
      [hashedPassword, adminUser.id]
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log(`📅 Updated at: ${updateResult.rows[0].updated_at}`);
      
      // Log security event
      await client.query(
        `INSERT INTO security_logs (user_id, action, ip_address, success, details) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          adminUser.id,
          'admin_password_change',
          '127.0.0.1',
          true,
          JSON.stringify({ method: 'manual_script', timestamp: new Date() })
        ]
      );

      console.log('\n🔐 Security Notes:');
      console.log('• Password change has been logged for security audit');
      console.log('• You can now sign in with your new password');
      console.log('• Consider enabling 2FA for additional security');
      
    } else {
      console.log('❌ Failed to update password');
    }

  } catch (error) {
    console.error('❌ Error changing password:', error.message);
  } finally {
    await client.end();
    rl.close();
    process.exit(0);
  }
}

// Main execution
async function main() {
  await changeAdminPassword();
}

main().catch(console.error);
