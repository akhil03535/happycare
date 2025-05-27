import axios from 'axios';

async function testSMS() {
    try {
        const response = await axios.post('http://localhost:5000/api/send-sms', {
            to: '+919704370156',
            message: '🚨 CRITICAL ALERT TEST 🚨\n\nThis is a test of your Health Monitoring System.\n\nIf you receive this message, your notification system is working correctly.\n\nTime: ' + new Date().toLocaleString()
        });

        console.log('SMS Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testSMS();
