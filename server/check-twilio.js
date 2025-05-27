import 'dotenv/config';
import twilio from 'twilio';

async function checkTwilioSetup() {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('Checking Twilio setup...\n');

    // Get account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);

    // List verified numbers
    const verifiedNumbers = await client.outgoingCallerIds.list();
    console.log('\nVerified Numbers:');
    verifiedNumbers.forEach(number => {
      console.log(`- ${number.phoneNumber} (${number.friendlyName})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTwilioSetup().catch(console.error);
