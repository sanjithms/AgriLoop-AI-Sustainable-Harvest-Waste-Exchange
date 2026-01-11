const express = require('express');
const router = express.Router();
const aiAdvisorController = require('../controllers/aiAdvisorController');

// Route for getting AI-powered agricultural advice
router.post('/ask', aiAdvisorController.getAdvice);

module.exports = router;