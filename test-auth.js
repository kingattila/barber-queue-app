require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPhoneAuth() {
  const phoneNumber = '+61405253462'; // Your personal phone number
  console.log(`Sending OTP to ${phoneNumber}...`);

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('OTP sent successfully! Check your phone for the 6-digit code.');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testPhoneAuth();