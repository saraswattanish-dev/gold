import dbService from './services/dbService.js';

const checkUser = async () => {
  const email = 'anshgupta0428@gmail.com';
  console.log(`Checking profile for: ${email}`);

  try {
    const user = await dbService.findUserByEmail(email);
    if (user) {
      console.log('User profile FOUND in database users table:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User profile NOT FOUND in database users table.');
    }
  } catch (err) {
    console.error('Error querying database:', err.message);
  }
};

checkUser();
