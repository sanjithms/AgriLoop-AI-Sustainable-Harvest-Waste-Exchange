const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Order = require("../models/Order");
const Product = require("../models/Product");
const WasteProduct = require("../models/WasteProduct");
const sendEmail = require("../config/emailConfig");
const crypto = require('crypto');

// Generate UPI QR Code data
const generateUPIQRData = (amount, orderId) => {
  const merchantUpiId = process.env.MERCHANT_UPI_ID || 'merchant-upi-id@ybl';
  const merchantName = encodeURIComponent('Smart Agri System');
  const transactionNote = encodeURIComponent(`Order #${orderId}`);
  return `upi://pay?pa=${merchantUpiId}&pn=${merchantName}&tn=${transactionNote}&am=${amount}`;
};

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  const { products, paymentMethod } = req.body;

  try {
    const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalAmount = paymentMethod === 'cod' ? totalAmount + 50 : totalAmount;

    // For non-card payments
    if (paymentMethod === 'upi' || paymentMethod === 'cod') {
      const tempOrderId = crypto.randomBytes(8).toString('hex');
      const qrCodeData = generateUPIQRData(finalAmount, tempOrderId);
      
      return res.json({ 
        success: true, 
        paymentMethod,
        totalAmount: finalAmount,
        codCharges: paymentMethod === 'cod' ? 50 : 0,
        qrCodeData: paymentMethod === 'upi' ? qrCodeData : null
      });
    }

    // Create Stripe payment intent for card payments
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount * 100, // Convert to paisa
      currency: "inr",
      payment_method_types: ["card"],
      metadata: {
        orderId: crypto.randomBytes(8).toString('hex')
      }
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret, 
      paymentMethod: 'card',
      totalAmount: finalAmount
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Payment error", error: err.message });
  }
};

// Verify UPI Payment
exports.verifyUPIPayment = async (req, res) => {
  const { upiId, upiTransactionId, amount } = req.body;

  try {
    // In a real implementation, you would verify the UPI transaction with a payment gateway
    // For now, we'll simulate a successful verification
    const isVerified = true;

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "UPI payment verification failed"
      });
    }

    res.json({
      success: true,
      message: "UPI payment verified successfully",
      transactionId: upiTransactionId
    });
  } catch (err) {
    console.error("UPI verification error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify UPI payment",
      error: err.message
    });
  }
};

// Create Order
exports.createOrder = async (req, res) => {
  try {
    let { 
      products, 
      shippingAddress, 
      paymentMethod = 'card',
      paymentDetails = {},
      isGift = false,
      giftMessage = ''
    } = req.body;

    // Ensure products is an array
    if (typeof products === 'string') {
      try {
        products = JSON.parse(products);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid products data format'
        });
      }
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      let product;
      if (item.isWasteProduct) {
        product = await WasteProduct.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Waste product ${item.product} not found`
          });
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.quantity} ${product.unit || 'units'} available for ${product.name}`
          });
        }
      } else {
        product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.product} not found`
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} ${product.unit || 'units'} available for ${product.name}`
          });
        }
      }

      const itemPrice = parseFloat(item.price);
      if (isNaN(itemPrice) || itemPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price format'
        });
      }

      totalAmount += itemPrice * item.quantity;

      validatedProducts.push({
        product: item.product,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        image: item.isWasteProduct ? (product.images && product.images[0]) : product.image,
        category: item.isWasteProduct ? 'Waste' : product.category,
        isWasteProduct: item.isWasteProduct || false,
        type: item.isWasteProduct ? product.type : undefined
      });
    }

    // Add COD charges if applicable
    if (paymentMethod === 'cod') {
      totalAmount += 50; // ₹50 COD charge
      paymentDetails.codCharges = 50;
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = `INV-${orderNumber}`;
    
    // Set estimated delivery date (7 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create order
    const order = await Order.create({
      orderNumber,
      invoiceNumber,
      buyer: req.user.id,
      products: validatedProducts,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      totalAmount,
      status: 'Processing', // Changed from 'Pending' to 'Processing'
      estimatedDelivery,
      isGift,
      giftMessage,
      statusHistory: [{
        status: 'Processing',
        timestamp: new Date(),
        notes: 'Order placed successfully',
        updatedBy: req.user.id
      }]
    });

    // Update product quantities
    for (const item of validatedProducts) {
      if (item.isWasteProduct) {
        await WasteProduct.findByIdAndUpdate(item.product, {
          $inc: { 
            quantity: -item.quantity,
            salesCount: item.quantity
          }
        });
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 
            stock: -item.quantity,
            salesCount: item.quantity
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.warn('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("products.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
