import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

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

    // Send a test message
    const message = await client.messages.create({
      body: 'Test message from your health monitoring system. If you receive this, your Twilio setup is working correctly.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+919704370156'  // Your verified number
    });

    console.log('\nTest Message Status:', message.status);
    console.log('Message SID:', message.sid);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
}

checkTwilioSetup();
