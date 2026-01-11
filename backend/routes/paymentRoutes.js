const express = require("express");
const { 
  createPaymentIntent, 
  createOrder, 
  getUserOrders,
  verifyUPIPayment 
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

// Route to create payment intent (Stripe API)
router.post("/create-payment-intent", protect, createPaymentIntent);

// Route to verify UPI payment
router.post("/verify-upi", protect, verifyUPIPayment);

// Route to create order after payment
router.post("/create-order", protect, createOrder);

// Route to fetch user orders
router.get("/orders", protect, getUserOrders);

module.exports = router;
