#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function registerAdmin() {
  const apiUrl = 'http://localhost:9000/api/auth/signup';
  
  const adminData = {
    email: 'admin@indii.music',
    password: 'MEMEx2025!',
    role: 'service_provider',
    profile: {
      company_name: 'Indii Music',
      service_type: 'Platform Administration',
      description: 'System administration and platform management'
    }
  };

  try {
    console.log('🔐 Registering admin user via API...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin user registered successfully!');
      console.log('📧 Email:', result.user.email);
      console.log('🔑 Password: MEMEx2025!');
      console.log('👤 Role:', result.user.role);
      
      if (result.token) {
        console.log('🎫 Token generated for immediate use');
      }
      
      // Test login immediately
      console.log('\n🧪 Testing login...');
      const loginResponse = await fetch('http://localhost:9000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@indii.music',
          password: 'MEMEx2025!'
        })
      });

      const loginResult = await loginResponse.json();
      
      if (loginResult.success) {
        console.log('✅ Login test successful!');
        console.log('🎉 Admin account is ready to use');
      } else {
        console.log('❌ Login test failed:', loginResult.message);
      }
      
    } else {
      console.log('❌ Registration failed:', result.message || result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

registerAdmin();
