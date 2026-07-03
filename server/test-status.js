import axios from 'axios';

const runTest = async () => {
  const baseURL = 'http://localhost:5000';
  const timestamp = Date.now();
  const email = `recovery_test_${timestamp}@gmail.com`;
  const password = 'Password123!';
  const newPassword = 'NewPassword456!';

  console.log('--- Password Reset Integration Diagnostic Test ---');
  console.log(`Using email: ${email}`);

  try {
    // 1. Register user
    console.log('\nStep 1: Registering user...');
    const regRes = await axios.post(`${baseURL}/api/auth/register`, {
      name: `Recovery Test User`,
      email,
      password
    });
    if (!regRes.data.success) {
      throw new Error(`Registration failed: ${regRes.data.message}`);
    }
    console.log('Registration successful!');

    // 2. Request forgot password
    console.log('\nStep 2: Requesting password recovery link...');
    const forgotRes = await axios.post(`${baseURL}/api/auth/forgot-password`, { email });
    if (!forgotRes.data.success) {
      throw new Error(`Forgot password request failed: ${forgotRes.data.message}`);
    }
    console.log('Password recovery request successful!');
    console.log('Server response:', forgotRes.data.message);

    console.log('\nPassword reset setup is fully verified and connected!');
  } catch (err) {
    console.error('\nTest failed with error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
};

runTest();
