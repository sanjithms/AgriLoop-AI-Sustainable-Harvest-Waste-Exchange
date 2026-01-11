const express = require('express');
const router = express.Router();
const {
  getWasteProducts,
  getWasteProductById,
  createWasteProduct,
  updateWasteProduct,
  deleteWasteProduct,
  getSellerWasteProducts,
  getWasteProductStats
} = require('../controllers/wasteProductController');
const { protect, admin, sellerOnly } = require('../middlewares/authmiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getWasteProducts);

// Protected routes - only farmers and industry users can create/update waste products
router.post('/', protect, sellerOnly, upload.array('images', 5), upload.fixPaths, createWasteProduct);
router.get('/seller/my-listings', protect, getSellerWasteProducts);

// Routes with ID parameter - must come after other specific routes
router.get('/:id', getWasteProductById);
router.put('/:id', protect, upload.array('images', 5), upload.fixPaths, updateWasteProduct);
router.delete('/:id', protect, deleteWasteProduct);

// Admin routes
router.get('/admin/stats', protect, admin, getWasteProductStats);

module.exports = router;