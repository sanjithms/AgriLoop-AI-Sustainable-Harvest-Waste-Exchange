/**
 * AI Routes
 * Routes for AI-related features
 */

const express = require('express');
const {
  generateCropRecommendations,
  answerQuestion,
  analyzeCropDisease,
  analyzeMarketSentiment,
  summarizeNews
} = require('../controllers/aiController');

const router = express.Router();

// Route to generate crop recommendations
router.post('/crop-recommendations', generateCropRecommendations);

// Route to answer agricultural questions
router.post('/answer-question', answerQuestion);

// Route to analyze crop disease
router.post('/analyze-disease', analyzeCropDisease);

// Route to analyze market sentiment
router.post('/market-sentiment', analyzeMarketSentiment);

// Route to summarize agricultural news
router.post('/summarize-news', summarizeNews);

module.exports = router;