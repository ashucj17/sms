require('dotenv').config();
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
            console.log('⏰ Sent at:', new Date().toLocaleString());
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

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    console.log('🚀 Welcome to SMS Sender!\n');
    
    try {
        const phoneNumber = await askQuestion('📱 Enter recipient phone number (with country code, e.g., +1234567890): ');
        const message = await askQuestion('💬 Enter your message: ');
        const choice = await askQuestion('📤 Send now or schedule? (now/schedule): ');
        
        if (choice.toLowerCase() === 'schedule') {
            const dateTime = await askQuestion('⏰ Enter date and time (YYYY-MM-DD HH:MM:SS): ');
            
            const now = new Date();
            const targetTime = new Date(dateTime);
            const delay = targetTime.getTime() - now.getTime();
            
            if (delay <= 0) {
                console.error('❌ Target time must be in the future!');
                rl.close();
                return;
            }
            
            console.log(`⏰ SMS scheduled for: ${targetTime.toLocaleString()}`);
            console.log(`⏳ Will be sent in ${Math.round(delay / 1000)} seconds`);
            
            setTimeout(() => {
                sendSMS(phoneNumber, twilioPhoneNumber, message)
                    .then(() => {
                        console.log('✅ Scheduled SMS sent successfully!');
                        rl.close();
                    })
                    .catch(error => {
                        console.error('❌ Failed to send scheduled SMS:', error.message);
                        rl.close();
                    });
            }, delay);
            
            console.log('🔄 Keep the script running to send the scheduled message...');
            
        } else {
            await sendSMS(phoneNumber, twilioPhoneNumber, message);
            console.log('\n✅ Message sent!');
            rl.close();
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
        rl.close();
    }
}

// Run the interactive version
if (require.main === module) {
    main();
}

module.exports = { sendSMS };