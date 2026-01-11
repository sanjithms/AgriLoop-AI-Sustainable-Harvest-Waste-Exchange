/**
 * Hugging Face AI Service
 * This service provides methods to interact with Hugging Face's Inference API
 */

const axios = require('axios');
require('dotenv').config();

// Base URL for Hugging Face Inference API
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Get API token from environment variables
const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

// Check if API token is available
if (!HF_API_TOKEN) {
  console.error('ERROR: HUGGING_FACE_API_TOKEN is not set in environment variables');
  console.error('AI functionality will not work properly without this token');
  console.error('Please add your Hugging Face API token to the .env file');
  console.error('You can get a token from: https://huggingface.co/settings/tokens');
}

/**
 * Make a request to the Hugging Face Inference API
 * @param {string} model - The model to use
 * @param {object} payload - The input data for the model
 * @returns {Promise<object>} - The model's response
 */
const query = async (model, payload) => {
  // Check if API token is available before making the request
  if (!HF_API_TOKEN) {
    throw new Error('HUGGING_FACE_API_TOKEN is not set in environment variables. Please add it to your .env file.');
  }

  try {
    const response = await axios({
      url: `${HF_API_URL}/${model}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: payload,
      // Increase timeout for larger models
      timeout: 60000
    });

    return response.data;
  } catch (error) {
    // Check if the model is still loading
    if (error.response && error.response.status === 503) {
      const errorMessage = error.response.data.error;
      if (errorMessage.includes('Loading')) {
        console.log(`Model ${model} is loading. Waiting 20 seconds before retrying...`);
        // Wait for 20 seconds
        await new Promise(resolve => setTimeout(resolve, 20000));
        // Retry the request
        return query(model, payload);
      }
    }

    // Check for authentication errors
    if (error.response && error.response.status === 401) {
      console.error(`Authentication error: Invalid or expired Hugging Face API token`);
      throw new Error('Invalid or expired Hugging Face API token. Please check your token in the .env file.');
    }

    console.error(`Error querying Hugging Face API for model ${model}:`, error.message);
    throw error;
  }
};

/**
 * Generate text based on a prompt
 * @param {string} prompt - The input prompt
 * @param {object} options - Generation options
 * @returns {Promise<string>} - The generated text
 */
const generateText = async (prompt, options = {}) => {
  const model = options.model || 'gpt2';
  
  const payload = {
    inputs: prompt,
    parameters: {
      max_length: options.maxLength || 100,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      top_k: options.topK || 50,
      ...options.parameters
    },
    options: {
      wait_for_model: true
    }
  };
  
  try {
    const response = await query(model, payload);
    
    // Different models return different response formats
    if (Array.isArray(response)) {
      return response[0].generated_text;
    } else if (response.generated_text) {
      return response.generated_text;
    } else {
      return JSON.stringify(response);
    }
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

/**
 * Answer a question based on a context
 * @param {string} question - The question to answer
 * @param {string} context - The context to extract the answer from
 * @returns {Promise<object>} - The answer and score
 */
const answerQuestion = async (question, context) => {
  const model = 'deepset/roberta-base-squad2';
  
  const payload = {
    inputs: {
      question,
      context
    }
  };
  
  try {
    const response = await query(model, payload);
    return {
      answer: response.answer,
      score: response.score
    };
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
};

/**
 * Analyze sentiment of a text
 * @param {string} text - The text to analyze
 * @returns {Promise<object>} - The sentiment analysis result
 */
const analyzeSentiment = async (text) => {
  const model = 'distilbert-base-uncased-finetuned-sst-2-english';
  
  const payload = {
    inputs: text
  };
  
  try {
    const response = await query(model, payload);
    return response[0];
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

/**
 * Classify crop disease based on description
 * @param {string} description - The description of the crop symptoms
 * @returns {Promise<object>} - The classification result
 */
const classifyCropDisease = async (description) => {
  // Using a general text classification model
  // In a real application, you would use a model fine-tuned for crop diseases
  const model = 'facebook/bart-large-mnli';
  
  // Define possible disease categories
  const labels = [
    "Fungal Infection",
    "Bacterial Infection",
    "Viral Infection",
    "Nutrient Deficiency",
    "Pest Infestation",
    "Environmental Stress"
  ];
  
  const payload = {
    inputs: description,
    parameters: {
      candidate_labels: labels
    }
  };
  
  try {
    const response = await query(model, payload);
    return {
      labels: response.labels,
      scores: response.scores,
      topLabel: response.labels[0],
      topScore: response.scores[0]
    };
  } catch (error) {
    console.error('Error classifying crop disease:', error);
    throw error;
  }
};

/**
 * Summarize a long text
 * @param {string} text - The text to summarize
 * @param {number} maxLength - Maximum length of the summary
 * @returns {Promise<string>} - The summarized text
 */
const summarizeText = async (text, maxLength = 100) => {
  const model = 'facebook/bart-large-cnn';
  
  const payload = {
    inputs: text,
    parameters: {
      max_length: maxLength,
      min_length: 30
    }
  };
  
  try {
    const response = await query(model, payload);
    
    if (Array.isArray(response)) {
      return response[0].summary_text;
    } else if (response.summary_text) {
      return response.summary_text;
    } else {
      return JSON.stringify(response);
    }
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw error;
  }
};

/**
 * Generate crop recommendations based on conditions
 * @param {object} conditions - The growing conditions
 * @returns {Promise<string>} - The recommendations
 */
const generateCropRecommendations = async (conditions) => {
  const { soilType, climate, region, previousCrops } = conditions;
  
  // Create a prompt for the AI model
  const prompt = `Based on the following information, recommend suitable crops to grow:
Soil Type: ${soilType}
Climate: ${climate}
Region: ${region}
Previous Crops: ${previousCrops || 'None'}

Recommended crops:`;
  
  try {
    // Use a larger model for better recommendations
    const recommendations = await generateText(prompt, {
      model: 'gpt2-xl',
      maxLength: 200,
      temperature: 0.7
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error generating crop recommendations:', error);
    throw error;
  }
};

/**
 * Get treatment recommendations for crop diseases
 * @param {string} disease - The identified disease
 * @param {string} cropType - The type of crop
 * @returns {Promise<string>} - The treatment recommendations
 */
const getDiseaseRecommendations = async (disease, cropType) => {
  // Create a prompt for the AI model
  const prompt = `Provide treatment recommendations for ${disease} in ${cropType} crops. Include organic and chemical control methods, preventive measures, and best practices.`;
  
  try {
    const recommendations = await generateText(prompt, {
      model: 'gpt2-xl',
      maxLength: 300,
      temperature: 0.7
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error getting disease recommendations:', error);
    throw error;
  }
};

module.exports = {
  generateText,
  answerQuestion,
  analyzeSentiment,
  classifyCropDisease,
  summarizeText,
  generateCropRecommendations,
  getDiseaseRecommendations
};