require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('❌ Missing required environment variables!');
    console.error('Please create a .env file with:');
    console.error('TWILIO_ACCOUNT_SID=your_account_sid');
    console.error('TWILIO_AUTH_TOKEN=your_auth_token');
    console.error('TWILIO_PHONE_NUMBER=your_twilio_phone_number');
    process.exit(1);
}

const client = require('twilio')(accountSid, authToken);

function sendSMS(to, from, message) {
    return client.messages
        .create({
            to: to,
            from: from,
            body: message,
        })
        .then(message => {
            console.log('✅ Message sent successfully!');
            console.log('📱 To:', to);
            console.log('📞 From:', from);
            console.log('🆔 Message SID:', message.sid);
            console.log('📊 Status:', message.status);
            return message;
        })
        .catch(error => {
            console.error('❌ Error sending message:', error.message);
            
            if (error.code === 20003) {
                console.error('🔑 Authentication failed - check your credentials');
            } else if (error.code === 21211) {
                console.error('📱 Invalid phone number format');
            } else if (error.code === 21408) {
                console.error('🌍 SMS not enabled for this region');
            }
            
            throw error;
        });
}

// Example usage
const myPhoneNumber = process.env.MY_PHONE_NUMBER;
if (myPhoneNumber && accountSid && authToken && twilioPhoneNumber) {
    const message = "Hello from Node.js! This message is sent securely using environment variables. 🚀";
    
    sendSMS(myPhoneNumber, twilioPhoneNumber, message)
        .then(() => console.log('✅ SMS sent successfully!'))
        .catch(error => console.error('❌ Failed to send SMS:', error.message));
}

module.exports = {
    sendSMS,
    client
};