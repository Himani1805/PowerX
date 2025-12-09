import dotenv from 'dotenv';
dotenv.config(); // Load .env first!

import nodemailer from 'nodemailer';

console.log('📧 Testing Email Configuration...\n');

// Show what values are loaded
console.log('Configuration:');
console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
});

async function testEmail() {
    try {
        console.log('🔄 Sending test email...');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'PowerX CRM - Email Test ✅',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4F46E5;">🎉 Success!</h2>
                    <p>Your PowerX CRM email configuration is working correctly!</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Time: ${new Date().toLocaleString()}<br>
                        Host: ${process.env.EMAIL_HOST}<br>
                        Port: ${process.env.EMAIL_PORT}
                    </p>
                </div>
            `,
            text: 'PowerX CRM email is working! 🎉',
        });
        
        console.log('✅ Email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('📧 Check your inbox:', process.env.EMAIL_USER);
        
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        console.error('\n💡 Troubleshooting tips:');
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('  • Check EMAIL_HOST and EMAIL_PORT in .env');
            console.error('  • Make sure you have internet connection');
        } else if (error.message.includes('Invalid login')) {
            console.error('  • Use App Password, not your Gmail password');
            console.error('  • Generate one at: https://myaccount.google.com/apppasswords');
        } else {
            console.error('  • Full error:', error);
        }
    }
}

testEmail();
