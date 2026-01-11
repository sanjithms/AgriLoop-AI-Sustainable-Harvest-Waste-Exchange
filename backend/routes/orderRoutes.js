const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authmiddleware');

// User routes
router.post('/', protect, orderController.createOrder);
router.get('/myorders', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/cancel', protect, orderController.cancelOrder);

// Admin routes
router.get('/', protect, admin, orderController.getAllOrders);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);
router.get('/stats/dashboard', protect, admin, orderController.getOrderStats);

module.exports = router;
