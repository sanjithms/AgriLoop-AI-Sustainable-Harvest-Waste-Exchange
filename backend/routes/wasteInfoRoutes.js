const express = require('express');
const router = express.Router();
const wasteInfoController = require('../controllers/wasteInfoController');
const { protect, admin } = require('../middlewares/authmiddleware');

// Public routes
router.get('/search', wasteInfoController.searchWasteInfo);
router.get('/', wasteInfoController.getAllWasteInfo); // This should be before /:wasteName to avoid conflict
router.get('/:wasteName', wasteInfoController.getWasteInfo);

// Protected admin routes
router.post('/', protect, admin, wasteInfoController.addWasteInfo);
router.put('/:id', protect, admin, wasteInfoController.updateWasteInfo);

module.exports = router;