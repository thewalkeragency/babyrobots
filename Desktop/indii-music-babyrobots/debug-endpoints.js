#!/usr/bin/env node

const endpoints = [
  { method: 'GET', path: '/api/health' },
  { method: 'GET', path: '/api/db/status' },
  { method: 'POST', path: '/api/ai/chat', body: { message: 'test' } },
  { method: 'POST', path: '/api/auth/login', body: { email: 'test@test.com', password: 'test' } },
  { method: 'GET', path: '/api/tracks' },
];

const BASE_URL = 'http://localhost:9000';

async function testEndpoint(endpoint) {
  try {
    const options = {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    };

    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint.path}`, options);
    const status = response.status;
    
    let body = '';
    try {
      body = await response.text();
    } catch (e) {
      body = 'Could not read response body';
    }

    console.log(`${endpoint.method} ${endpoint.path}: ${status}`);
    
    if (status >= 500) {
      console.log(`  ERROR BODY: ${body.substring(0, 200)}...`);
    }
    
    return { path: endpoint.path, status, body };
  } catch (error) {
    console.log(`${endpoint.method} ${endpoint.path}: TIMEOUT/ERROR - ${error.message}`);
    return { path: endpoint.path, status: 'ERROR', error: error.message };
  }
}

async function main() {
  console.log('Testing API endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
}

main().catch(console.error);
