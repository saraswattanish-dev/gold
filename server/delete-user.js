import { supabase } from './config/supabase.js';

const cleanUser = async () => {
  if (!supabase) {
    console.log('Supabase client is not configured.');
    return;
  }

  const email = 'anshgupta0428@gmail.com';
  console.log(`Attempting to clean up profile for: ${email}`);

  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error deleting profile:', error.message);
    } else {
      console.log('Clean up successful! Profile row deleted from users table.');
    }
  } catch (err) {
    console.error('Exception occurred:', err.message);
  }
};

cleanUser();
