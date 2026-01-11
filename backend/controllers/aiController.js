/**
 * AI Controller
 * Handles requests related to AI features
 */

const huggingFaceService = require('../services/huggingFaceService');

// Generate crop recommendations
exports.generateCropRecommendations = async (req, res) => {
  const { soilType, climate, region, previousCrops } = req.body;
  
  // Validate required fields
  if (!soilType || !climate || !region) {
    return res.status(400).json({
      success: false,
      message: 'Soil type, climate, and region are required'
    });
  }
  
  try {
    // Generate recommendations
    const recommendations = await huggingFaceService.generateCropRecommendations({
      soilType,
      climate,
      region,
      previousCrops
    });
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error generating crop recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crop recommendations',
      error: error.message
    });
  }
};

// Answer agricultural questions
exports.answerQuestion = async (req, res) => {
  const { question } = req.body;
  
  // Validate required fields
  if (!question) {
    return res.status(400).json({
      success: false,
      message: 'Question is required'
    });
  }
  
  try {
    // Create a context about agriculture
    const context = `Agriculture is the science and art of cultivating plants and livestock. Agriculture was the key development in the rise of sedentary human civilization, whereby farming of domesticated species created food surpluses that enabled people to live in cities. Modern agronomy, plant breeding, agrochemicals such as pesticides and fertilizers, and technological developments have sharply increased crop yields, while causing widespread ecological and environmental damage. Selective breeding and modern practices in animal husbandry have similarly increased the output of meat, but have raised concerns about animal welfare and environmental damage. Environmental issues include contributions to global warming, depletion of aquifers, deforestation, antibiotic resistance, and growth hormones in industrial meat production.`;
    
    // Get answer from AI
    const answer = await huggingFaceService.answerQuestion(question, context);
    
    res.json({
      success: true,
      answer: answer.answer,
      confidence: answer.score
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message
    });
  }
};

// Analyze crop disease
exports.analyzeCropDisease = async (req, res) => {
  const { symptoms, cropType } = req.body;
  
  // Validate required fields
  if (!symptoms) {
    return res.status(400).json({
      success: false,
      message: 'Symptoms are required'
    });
  }
  
  try {
    // Classify disease based on symptoms
    const classification = await huggingFaceService.classifyCropDisease(symptoms);
    
    // Get treatment recommendations
    const treatment = await huggingFaceService.getDiseaseRecommendations(
      classification.topLabel,
      cropType || 'general'
    );
    
    res.json({
      success: true,
      disease: classification.topLabel,
      confidence: classification.topScore,
      allPossibleDiseases: classification.labels.map((label, index) => ({
        disease: label,
        probability: classification.scores[index]
      })),
      treatment
    });
  } catch (error) {
    console.error('Error analyzing crop disease:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze crop disease',
      error: error.message
    });
  }
};

// Analyze market sentiment
exports.analyzeMarketSentiment = async (req, res) => {
  const { marketReport } = req.body;
  
  // Validate required fields
  if (!marketReport) {
    return res.status(400).json({
      success: false,
      message: 'Market report is required'
    });
  }
  
  try {
    // Analyze sentiment of market report
    const sentiment = await huggingFaceService.analyzeSentiment(marketReport);
    
    // Format the response
    const result = {
      sentiment: sentiment[0].label === 'POSITIVE' ? 'positive' : 'negative',
      score: sentiment[0].score,
      analysis: `The market report has a ${sentiment[0].label.toLowerCase()} sentiment with ${(sentiment[0].score * 100).toFixed(2)}% confidence.`
    };
    
    res.json({
      success: true,
      sentiment: result
    });
  } catch (error) {
    console.error('Error analyzing market sentiment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze market sentiment',
      error: error.message
    });
  }
};

// Summarize agricultural news
exports.summarizeNews = async (req, res) => {
  const { newsArticle } = req.body;
  
  // Validate required fields
  if (!newsArticle) {
    return res.status(400).json({
      success: false,
      message: 'News article is required'
    });
  }
  
  try {
    // Summarize news article
    const summary = await huggingFaceService.summarizeText(newsArticle, 150);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error summarizing news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize news',
      error: error.message
    });
  }
};