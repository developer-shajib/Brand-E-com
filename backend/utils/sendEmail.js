import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.type - Email type (verification, notification, reset, order)
 * @param {Object} options.data - Data for email template
 * @returns {Promise<Boolean>} - True if email sent successfully
 */
const sendEmail = async (options) => {
  try {
    // Create transporter with more explicit configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      //   secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Add these options to fix SSL issues
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        // Force specific TLS version
        minVersion: 'TLSv1.2'
      },
      debug: process.env.NODE_ENV !== 'production' // Enable debug in non-production
    });

    // Set default values
    const { email, subject, type = 'notification', data = {} } = options;

    // Generate HTML content based on email type
    const htmlContent = generateEmailTemplate(type, data, options);

    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Branding E-commerce'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent
    };

    // Verify connection configuration before sending
    if (process.env.NODE_ENV !== 'production') {
      console.log('Verifying email connection configuration...');
      const verification = await transporter.verify();
      console.log('Server is ready to take our messages:', verification);
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Log more detailed error information
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.command) {
      console.error(`Failed command: ${error.command}`);
    }
    return false;
  }
};

/**
 * Generate email template based on type
 * @param {String} type - Email type
 * @param {Object} data - Template data
 * @returns {String} - HTML content
 */
const generateEmailTemplate = (type, data, options) => {
  // Common styles for all email templates
  const styles = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    p {
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #45a049;
    }
    .code {
      display: inline-block;
      padding: 10px 20px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      font-size: 18px;
      letter-spacing: 2px;
      margin: 20px 0;
    }
    .highlight {
      color: #4CAF50;
      font-weight: bold;
    }
    .order-details {
      background-color: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .order-total {
      font-weight: bold;
      text-align: right;
      margin-top: 15px;
    }
  `;

  // Get company name from env or use default
  const companyName = process.env.COMPANY_NAME;
  const companyLogo = process.env.COMPANY_LOGO || 'https://via.placeholder.com/150x50?text=Logo';
  const companyAddress = process.env.COMPANY_ADDRESS || '123 E-commerce Street, Shopping District, BD';
  const companyEmail = process.env.COMPANY_EMAIL;
  const year = new Date().getFullYear();

  // Common header and footer for all templates
  const header = `
    <div class="header">
      <img src="${companyLogo}" alt="${companyName}" class="logo">
      <h1>${companyName}</h1>
    </div>
  `;

  const footer = `
    <div class="footer">
      <p>&copy; ${year} ${companyName}. All rights reserved.</p>
      <p>${companyAddress}</p>
      <p>If you have any questions, please contact us at <a href="mailto:${companyEmail}">${companyEmail}</a></p>
    </div>
  `;

  // Generate template based on type
  let content = '';

  switch (type) {
    case 'verification':
      const verificationUrl = data.verificationUrl || '#';
      const buttonText = data.buttonText || 'Verify Email';

      content = `
        <div class="content">
          <h2>Email Verification</h2>
          <p>Hello ${data.name || 'there'},</p>
          <p>Thank you for registering with ${companyName}. Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button" style="background-color:rgb(48, 46, 46); color:white;">${buttonText}</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `;
      break;

    case 'reset':
      const resetUrl = data.resetUrl || '#';
      const resetButtonText = data.buttonText || 'Reset Password';

      content = `
        <div class="content">
          <h2>Password Reset</h2>
          <p>Hello ${data.name || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button" style="background-color: #2196F3;">${resetButtonText}</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          
          <p>This password reset link will expire in 1 hour.</p>
          
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `;
      break;

    case 'order':
      const orderItems = data.items || [];
      const orderTotal = data.total || '0.00';
      const orderNumber = data.orderNumber || 'N/A';
      const orderDate = data.orderDate || new Date().toLocaleDateString();
      const trackingUrl = data.trackingUrl || '#';
      const orderButtonText = data.buttonText || 'Track Order';

      let itemsHtml = '';
      if (orderItems.length > 0) {
        orderItems.forEach((item) => {
          itemsHtml += `
            <div class="order-item">
              <div>${item.name} x ${item.quantity}</div>
              <div>$${item.price.toFixed(2)}</div>
            </div>
          `;
        });
      }

      content = `
        <div class="content">
          <h2>Order Confirmation</h2>
          <p>Hello ${data.name || 'there'},</p>
          <p>Thank you for your order! We're pleased to confirm that we've received your order.</p>
          
          <div class="order-details">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            
            <h3>Order Summary</h3>
            ${itemsHtml}
            
            <div class="order-total">
              <p>Total: $${orderTotal}</p>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${trackingUrl}" class="button" style="background-color: #FF9800;">${orderButtonText}</a>
          </div>
          
          <p>If you have any questions about your order, please contact our customer service team.</p>
        </div>
      `;
      break;

    case 'welcome':
      const welcomeUrl = data.welcomeUrl || '#';
      const welcomeButtonText = data.buttonText || 'Start Shopping';

      content = `
        <div class="content">
          <h2>Welcome to ${companyName}!</h2>
          <p>Hello ${data.name || 'there'},</p>
          <p>Thank you for joining ${companyName}! We're excited to have you as part of our community.</p>
          
          <p>With your new account, you can:</p>
          <ul>
            <li>Shop our latest products</li>
            <li>Track your orders</li>
            <li>Save items to your wishlist</li>
            <li>Receive exclusive offers and promotions</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${welcomeUrl}" class="button" style="background-color: #9C27B0;">${welcomeButtonText}</a>
          </div>
          
          <p>If you have any questions or need assistance, our customer service team is always ready to help.</p>
        </div>
      `;
      break;

    default: // notification
      const notificationUrl = data.url || '#';
      const notificationButtonText = data.buttonText || 'Learn More';

      content = `
        <div class="content">
          <h2>${data.title || 'Notification'}</h2>
          <p>Hello ${data.name || 'there'},</p>
          <p>${data.message || 'This is a notification from our system.'}</p>
          
          ${
            data.url
              ? `
          <div style="text-align: center;">
            <a href="${notificationUrl}" class="button" style="background-color: ${data.buttonColor || '#607D8B'};">${notificationButtonText}</a>
          </div>
          `
              : ''
          }
          
          <p>${data.additionalInfo || ''}</p>
        </div>
      `;
      break;
  }

  // Combine all parts into a complete HTML email
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options?.subject || 'Email from ' + companyName}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="container">
        ${header}
        ${content}
        ${footer}
      </div>
    </body>
    </html>
  `;
};

export default sendEmail;
