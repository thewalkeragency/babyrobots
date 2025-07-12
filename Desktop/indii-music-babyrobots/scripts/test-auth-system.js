#!/usr/bin/env node

/**
 * Enhanced Authentication System Test Script
 * Tests all RING 1 Phase 1 authentication features
 */

import { jwtService } from '../src/lib/jwt-service.js';
import { passwordService } from '../src/lib/password-service.js';
import { emailVerificationService } from '../src/lib/email-verification-service.js';

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
  test: (msg) => console.log(`${colors.cyan}🧪${colors.reset} ${msg}`)
};

async function testJWTService() {
  log.test('Testing Enhanced JWT Service...');
  
  try {
    // Test token generation
    const userPayload = {
      userId: 123,
      email: 'test@example.com',
      role: 'artist'
    };

    const tokenPair = jwtService.generateTokenPair(userPayload);
    log.success('Token pair generated successfully');
    log.info(`Access token: ${tokenPair.accessToken.substring(0, 50)}...`);
    log.info(`Refresh token: ${tokenPair.refreshToken.substring(0, 50)}...`);

    // Test access token validation
    const validation = jwtService.validateToken(tokenPair.accessToken);
    if (validation.valid) {
      log.success('Access token validation successful');
      log.info(`User: ${validation.user.email} (${validation.user.role})`);
    } else {
      log.error('Access token validation failed');
      return false;
    }

    // Test refresh token validation
    const refreshValidation = jwtService.verifyRefreshToken(tokenPair.refreshToken);
    if (refreshValidation.valid) {
      log.success('Refresh token validation successful');
    } else {
      log.error('Refresh token validation failed');
      return false;
    }

    // Test token refresh
    const refreshResult = jwtService.refreshAccessToken(tokenPair.refreshToken, userPayload);
    if (refreshResult.success) {
      log.success('Token refresh successful');
      log.info(`New access token: ${refreshResult.accessToken.substring(0, 50)}...`);
    } else {
      log.error('Token refresh failed');
      return false;
    }

    // Test token blacklisting
    const blacklistResult = jwtService.blacklistToken(tokenPair.accessToken, userPayload.userId);
    if (blacklistResult.success) {
      log.success('Token blacklisting successful');
    } else {
      log.error('Token blacklisting failed');
      return false;
    }

    // Test blacklisted token validation (should fail)
    const blacklistedValidation = jwtService.validateToken(tokenPair.accessToken);
    if (!blacklistedValidation.valid) {
      log.success('Blacklisted token correctly rejected');
    } else {
      log.error('Blacklisted token incorrectly accepted');
      return false;
    }

    return true;

  } catch (error) {
    log.error(`JWT Service test failed: ${error.message}`);
    return false;
  }
}

async function testPasswordService() {
  log.test('Testing Enhanced Password Service...');
  
  try {
    const testPassword = 'TestPassword123!';
    const weakPassword = 'password';

    // Test password strength validation
    const strengthCheck = passwordService.validatePasswordStrength(testPassword);
    if (strengthCheck.isStrong) {
      log.success('Strong password validation successful');
      log.info(`Password score: ${strengthCheck.score}/6`);
    } else {
      log.error(`Password validation failed: ${strengthCheck.message}`);
      return false;
    }

    // Test weak password rejection
    const weakCheck = passwordService.validatePasswordStrength(weakPassword);
    if (!weakCheck.isStrong) {
      log.success('Weak password correctly rejected');
    } else {
      log.error('Weak password incorrectly accepted');
      return false;
    }

    // Test password hashing
    const hashedPassword = await passwordService.hashPassword(testPassword);
    log.success('Password hashing successful');
    log.info(`Hash: ${hashedPassword.substring(0, 50)}...`);

    // Test password verification
    const isValid = await passwordService.verifyPassword(testPassword, hashedPassword);
    if (isValid) {
      log.success('Password verification successful');
    } else {
      log.error('Password verification failed');
      return false;
    }

    // Test wrong password rejection
    const isInvalid = await passwordService.verifyPassword('wrongpassword', hashedPassword);
    if (!isInvalid) {
      log.success('Wrong password correctly rejected');
    } else {
      log.error('Wrong password incorrectly accepted');
      return false;
    }

    // Test password reset token generation
    const resetResult = await passwordService.generatePasswordResetToken('test@example.com');
    if (resetResult.success) {
      log.success('Password reset token generated successfully');
      log.info(`Token expires in: ${resetResult.expiresIn} seconds`);

      // Test token verification
      const verifyResult = await passwordService.verifyPasswordResetToken(resetResult.token);
      if (verifyResult.valid) {
        log.success('Reset token verification successful');
      } else {
        log.error('Reset token verification failed');
        return false;
      }
    } else {
      log.error(`Reset token generation failed: ${resetResult.error}`);
      return false;
    }

    return true;

  } catch (error) {
    log.error(`Password Service test failed: ${error.message}`);
    return false;
  }
}

async function testEmailVerificationService() {
  log.test('Testing Email Verification Service...');
  
  try {
    const testEmail = 'test@example.com';
    const testUserId = 123;

    // Test verification token generation
    const tokenResult = await emailVerificationService.generateVerificationToken(testEmail, testUserId);
    if (tokenResult.success) {
      log.success('Email verification token generated successfully');
      log.info(`Verification URL: ${tokenResult.verificationUrl}`);

      // Test email verification
      const verifyResult = await emailVerificationService.verifyEmail(tokenResult.token);
      if (verifyResult.success) {
        log.success('Email verification successful');
        log.info(`Verified email: ${verifyResult.email}`);
      } else {
        log.error(`Email verification failed: ${verifyResult.error}`);
        return false;
      }
    } else {
      log.error(`Verification token generation failed: ${tokenResult.error}`);
      return false;
    }

    // Test verification statistics
    const stats = emailVerificationService.getVerificationStats();
    log.success('Verification statistics retrieved');
    log.info(`Active tokens: ${stats.activeVerificationTokens || 'N/A'}`);

    return true;

  } catch (error) {
    log.error(`Email Verification Service test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`${colors.magenta}🔐 Enhanced Authentication System Tests${colors.reset}\n`);
  
  const tests = [
    { name: 'JWT Service', test: testJWTService },
    { name: 'Password Service', test: testPasswordService },
    { name: 'Email Verification Service', test: testEmailVerificationService }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    log.info(`\n--- Testing ${name} ---`);
    
    try {
      const result = await test();
      if (result) {
        log.success(`${name} tests PASSED`);
        passed++;
      } else {
        log.error(`${name} tests FAILED`);
        failed++;
      }
    } catch (error) {
      log.error(`${name} tests FAILED with error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${colors.magenta}--- Test Results ---${colors.reset}`);
  log.success(`Passed: ${passed}`);
  if (failed > 0) {
    log.error(`Failed: ${failed}`);
  } else {
    log.info(`Failed: ${failed}`);
  }

  if (failed === 0) {
    log.success('🎉 All authentication system tests PASSED!');
    log.info('RING 1 Phase 1 authentication system is ready for production');
  } else {
    log.error('❌ Some tests failed. Please check the implementation.');
  }

  return failed === 0;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

export { runAllTests };
