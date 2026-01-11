const express = require('express');
const router = express.Router();
const wasteClassificationController = require('../controllers/wasteClassificationController');
const upload = require('../middlewares/uploadMiddleware');

// Route for classifying waste from an image
router.post('/', upload.single('image'), upload.fixPaths, wasteClassificationController.classifyWasteImage);

module.exports = router;