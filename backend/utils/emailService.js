const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmation #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Order Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your order! We're pleased to confirm that we've received your order.</p>
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
        <h3>Items Ordered:</h3>
        <ul>
          ${order.products.map(item => `
            <li>
              ${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price.toFixed(2)}
            </li>
          `).join('')}
        </ul>
        <p>You can track your order status by logging into your account.</p>
        <p>Thank you for shopping with Smart Agri System!</p>
      </div>
    `
  }),
  
  paymentUpdate: (order, user, status) => ({
    subject: `Payment ${status} for Order #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Payment ${status}</h2>
        <p>Dear ${user.name},</p>
        <p>We're writing to inform you that the payment for your order #${order.orderNumber} has been ${status.toLowerCase()}.</p>
        <h3>Payment Details:</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
        <p><strong>Payment Status:</strong> ${status}</p>
        <p>If you have any questions about your payment, please contact our customer support.</p>
        <p>Thank you for shopping with Smart Agri System!</p>
      </div>
    `
  }),
  
  deliveryUpdate: (order, user, status) => ({
    subject: `Delivery ${status} for Order #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Delivery ${status}</h2>
        <p>Dear ${user.name},</p>
        <p>We're writing to inform you that the status of your order #${order.orderNumber} has been updated to ${status}.</p>
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        ${status === 'Shipped' ? `
          <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'N/A'}</p>
          <p><strong>Carrier:</strong> ${order.carrier || 'N/A'}</p>
        ` : ''}
        <p>You can track your order status by logging into your account.</p>
        <p>Thank you for shopping with Smart Agri System!</p>
      </div>
    `
  }),
  
  newReview: (product, review, seller) => ({
    subject: `New Review for ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">New Product Review</h2>
        <p>Dear ${seller.name},</p>
        <p>A customer has left a review for your product "${product.name}".</p>
        <h3>Review Details:</h3>
        <p><strong>Rating:</strong> ${review.rating} out of 5</p>
        <p><strong>Comment:</strong> "${review.comment}"</p>
        <p>You can respond to this review by logging into your account.</p>
        <p>Thank you for being a valued seller on Smart Agri System!</p>
      </div>
    `
  }),
  
  feedbackReceived: (feedback, admin) => ({
    subject: `New Feedback: ${feedback.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">New Feedback Received</h2>
        <p>Dear ${admin.name},</p>
        <p>A new feedback has been submitted on the platform.</p>
        <h3>Feedback Details:</h3>
        <p><strong>Type:</strong> ${feedback.type}</p>
        <p><strong>Subject:</strong> ${feedback.subject}</p>
        <p><strong>Message:</strong> "${feedback.message}"</p>
        <p><strong>Submitted By:</strong> ${feedback.user.name} (${feedback.user.email})</p>
        <p>Please review and take appropriate action.</p>
      </div>
    `
  }),
  
  feedbackResponse: (feedback, user) => ({
    subject: `Response to Your Feedback: ${feedback.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Feedback Response</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your feedback. We have reviewed your submission and here's our response:</p>
        <h3>Your Feedback:</h3>
        <p><strong>Subject:</strong> ${feedback.subject}</p>
        <p><strong>Message:</strong> "${feedback.message}"</p>
        <h3>Our Response:</h3>
        <p>${feedback.response.message}</p>
        <p>If you have any further questions or concerns, please don't hesitate to contact us.</p>
        <p>Thank you for helping us improve Smart Agri System!</p>
      </div>
    `
  }),
  
  newProductListing: (product, user) => ({
    subject: `New Product Listed: ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">New Product Available</h2>
        <p>Dear ${user.name},</p>
        <p>A new product that might interest you has been listed on our platform.</p>
        <h3>Product Details:</h3>
        <p><strong>Name:</strong> ${product.name}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> ₹${product.price.toFixed(2)}</p>
        <p><strong>Description:</strong> ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
        <p>Check out this product on our platform!</p>
        <p>Thank you for being a valued customer of Smart Agri System!</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    let subject, html;

    // Handle custom template (for OTP emails)
    if (template === 'custom' && Array.isArray(data) && data.length >= 2) {
      subject = data[0];
      html = data[1];
    } else {
      // Get the template function
      const templateFn = emailTemplates[template];
      if (!templateFn) {
        console.error(`Email template '${template}' not found`);
        return { messageId: 'template-not-found', success: false };
      }

      // Generate email content
      const emailContent = templateFn(...data);
      subject = emailContent.subject;
      html = emailContent.html;
    }

    // DEVELOPMENT MODE: Instead of actually sending emails, we'll log them
    // This allows testing without actual email credentials
    console.log('\n========== SIMULATED EMAIL ==========');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('CONTENT:');
    console.log(html.substring(0, 200) + '...');
    console.log('====================================\n');

    // Return success for development purposes
    return {
      messageId: `dev-${Date.now()}`,
      success: true,
      info: 'Email simulated successfully in development mode'
    };

    /* UNCOMMENT THIS CODE WHEN YOU HAVE VALID EMAIL CREDENTIALS
    // Send email
    const info = await transporter.sendMail({
      from: `"Smart Agri System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`Email sent successfully to ${to} with subject "${subject}"`);
    return { ...info, success: true };
    */
  } catch (error) {
    console.error('Error sending email:', error);

    // Provide more specific error messages for common issues
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check your EMAIL_USER and EMAIL_PASSWORD in .env file.');
      console.error('If using Gmail, make sure to use an App Password: https://support.google.com/accounts/answer/185833');
    } else if (error.code === 'ESOCKET') {
      console.error('Network error. Check your internet connection and firewall settings.');
    }

    return { messageId: 'error', error: error.message, success: false };
  }
};

module.exports = {
  sendEmail
};