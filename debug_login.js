// Test script to debug login API call
// Copy this into your browser console on https://find-my-spot-lac.vercel.app/

async function testLogin() {
  const API_URL = 'https://findmyspot-grxt.onrender.com/api';
  
  console.log('Testing API connection...');
  
  try {
    // First test health endpoint
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test login endpoint with dummy data
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Run the test
testLogin();
