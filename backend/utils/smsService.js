const https = require('https');

/**
 * Send SMS using a third-party SMS service
 * Note: This is a placeholder implementation. You'll need to replace it with your actual SMS provider.
 * Popular SMS providers include Twilio, MessageBird, Vonage (Nexmo), etc.
 * 
 * @param {string} phoneNumber - The recipient's phone number (with country code)
 * @param {string} message - The message to send
 * @returns {Promise<Object>} - Result of the SMS sending operation
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // Check if SMS sending is enabled
    if (!process.env.SMS_API_KEY || process.env.SMS_API_KEY === 'your-sms-api-key') {
      console.log('SMS sending is disabled. Set SMS_API_KEY in .env to enable.');
      console.log('Would have sent SMS:', { phoneNumber, message });
      return { messageId: 'sms-disabled', success: false };
    }

    // Format phone number (remove spaces, ensure it has country code)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // This is a placeholder implementation
    // Replace with your actual SMS provider's API call
    
    // Example using a generic HTTP request (replace with your provider's API)
    const smsData = JSON.stringify({
      apiKey: process.env.SMS_API_KEY,
      to: formattedPhone,
      message: message,
      sender: process.env.SMS_SENDER_ID || 'SmartAgri'
    });
    
    // This is a mock implementation - replace with actual API call
    // const result = await makeAPIRequest(smsData);
    
    // For now, we'll simulate a successful response
    console.log(`SMS would be sent to ${formattedPhone}: ${message}`);
    
    return { 
      messageId: `sms-${Date.now()}`, 
      success: true,
      info: 'SMS sent successfully (simulated)'
    };
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { messageId: 'error', error: error.message, success: false };
  }
};

/**
 * Format phone number to ensure it has country code
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove spaces, dashes, etc.
  let formatted = phoneNumber.replace(/\\s+|-|\\(|\\)/g, '');
  
  // Ensure it has country code (assuming India +91 if not present)
  if (!formatted.startsWith('+')) {
    // If it starts with 0, replace 0 with +91
    if (formatted.startsWith('0')) {
      formatted = '+91' + formatted.substring(1);
    } 
    // If it's a 10-digit number, add +91
    else if (formatted.length === 10) {
      formatted = '+91' + formatted;
    }
    // Otherwise just add + if it might already have country code without +
    else if (formatted.length > 10) {
      formatted = '+' + formatted;
    }
  }
  
  return formatted;
};

/**
 * Make API request to SMS provider (placeholder)
 * @param {string} data - The request data
 * @returns {Promise<Object>} - API response
 */
const makeAPIRequest = (data) => {
  return new Promise((resolve, reject) => {
    // Replace with your SMS provider's API endpoint
    const options = {
      hostname: 'api.smsprovider.com',
      port: 443,
      path: '/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (e) {
          reject(new Error('Failed to parse SMS API response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

// Create OTP SMS template
const otpSMSTemplate = (otp) => {
  return `Your Smart Agri System verification code is: ${otp}. This code will expire in 10 minutes.`;
};

module.exports = {
  sendSMS,
  otpSMSTemplate
};