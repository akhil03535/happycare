import axios from 'axios';

const phoneNumber = '+919704370156';  // Your phone number
const message = `🏥 Health Monitoring System Test\n\nThis is a test message to verify SMS functionality.\n\nTime: ${new Date().toLocaleString()}\n\nPlease confirm if you receive this message.`;

async function checkMessageStatus(messageId) {
    try {
        const response = await axios.get(`http://localhost:5000/api/message-status/${messageId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking message status:', error.response?.data || error.message);
        return null;
    }
}

async function testSMS() {
    try {
        console.log('=== SMS Test ===');
        console.log('Phone:', phoneNumber);
        console.log('Message:', message);
        console.log('\nSending message...');
        
        const response = await axios.post('http://localhost:5000/api/send-sms', {
            to: phoneNumber,
            message: message
        });

        console.log('\nInitial Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.messageId) {
            console.log('\nMonitoring message status...');
            
            // Check status multiple times
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const status = await checkMessageStatus(response.data.messageId);
                if (status) {
                    console.log(`\nStatus update ${i + 1}:`, JSON.stringify(status, null, 2));
                    
                    if (status.status === 'delivered') {
                        console.log('\n✅ Message delivered successfully!');
                        break;
                    } else if (status.status === 'failed' || status.status === 'undelivered') {
                        console.log('\n❌ Message delivery failed!');
                        console.log('Error:', status.errorMessage);
                        break;
                    }
                }
            }
        }
    } catch (error) {
        console.error('\nError sending SMS:', error.response?.data || error.message);
    }
}

console.log('Starting SMS test...\n');
testSMS();
