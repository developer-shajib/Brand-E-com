import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import sendEmail from './sendEmail.js';

dotenv.config();

/**
 * Test email configuration and sending
 */
const testEmailConfig = async () => {
  console.log('Testing email configuration...');

  // 1. Check environment variables
  console.log('\n--- Environment Variables Check ---');
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  let missingVars = false;

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      missingVars = true;
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });

  if (missingVars) {
    console.error('\n⚠️ Please set all required environment variables in your .env file');
    return;
  }

  // 2. Test SMTP connection
  console.log('\n--- SMTP Connection Test ---');
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      debug: true
    });

    console.log(`Attempting to connect to ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}...`);
    const verified = await transporter.verify();
    console.log('✅ SMTP connection successful:', verified);

    // 3. Test sending a simple email
    console.log('\n--- Test Email Sending ---');
    console.log('Sending a test email...');

    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;

    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Test Email',
      text: 'This is a test email to verify SMTP configuration',
      html: '<b>This is a test email to verify SMTP configuration</b>'
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    // 4. Test the sendEmail utility
    console.log('\n--- Testing sendEmail Utility ---');
    const result = await sendEmail({
      email: testEmail,
      subject: 'Test Verification Email',
      type: 'verification',
      data: {
        name: 'Test User',
        verificationUrl: 'https://example.com/verify'
      }
    });

    if (result) {
      console.log('✅ sendEmail utility test successful!');
    } else {
      console.error('❌ sendEmail utility test failed');
    }
  } catch (error) {
    console.error('❌ Error during email testing:', error);

    // Provide troubleshooting guidance based on error
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️ Connection refused. Possible solutions:');
      console.log('1. Check if the EMAIL_HOST and EMAIL_PORT are correct');
      console.log('2. Make sure your network allows connections to this mail server');
      console.log('3. Check if the mail server is running and accessible');
    } else if (error.code === 'ESOCKET' && error.message.includes('wrong version number')) {
      console.log('\n⚠️ SSL/TLS error. Possible solutions:');
      console.log('1. If using port 465, set EMAIL_SECURE=true');
      console.log('2. If using port 587 or 25, set EMAIL_SECURE=false');
      console.log('3. Try changing EMAIL_PORT to 587 (TLS) or 465 (SSL)');
    } else if (error.code === 'EAUTH') {
      console.log('\n⚠️ Authentication failed. Possible solutions:');
      console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct');
      console.log('2. For Gmail, you might need to use an App Password instead of your regular password');
      console.log('   Create one at: https://myaccount.google.com/apppasswords');
      console.log('3. Make sure "Less secure app access" is enabled for your email provider (if applicable)');
    }
  }
};

// Run the test
testEmailConfig();
