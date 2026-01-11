import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WasteClassifier.css';
import { updateCartBadge } from '../utils/cartUtils';
import axios from 'axios';

// Import TensorFlow.js and MobileNet
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const WasteClassifier = () => {
  const [classifiedWaste, setClassifiedWaste] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isFetchingSimilar, setIsFetchingSimilar] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  // Load TensorFlow model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);

        // Check if TensorFlow.js is available
        if (!tf) {
          throw new Error('TensorFlow.js library not loaded. Please check your dependencies.');
        }

        // Check if MobileNet is available
        if (!mobilenet) {
          throw new Error('MobileNet model not loaded. Please check your dependencies.');
        }

        // Load TensorFlow.js and MobileNet model
        await tf.ready();
        console.log('TensorFlow.js is ready');

        // Add a timeout to prevent hanging on model load
        const modelPromise = mobilenet.load();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Model loading timed out after 30 seconds')), 30000)
        );

        const loadedModel = await Promise.race([modelPromise, timeoutPromise]);
        setModel(loadedModel);
        setIsModelLoading(false);
        console.log('TensorFlow model loaded successfully');
      } catch (error) {
        console.error('Failed to load TensorFlow model:', error);
        setIsModelLoading(false);
        // Fallback notification if model fails to load
        alert('Failed to load AI model: ' + error.message + '\nPlease check your internet connection and try again.');
      }
    };

    loadModel();

    // Cleanup function
    return () => {
      // Dispose of any tensors when component unmounts
      if (tf.getBackend()) {
        tf.disposeVariables();
      }
    };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsClassifying(true);

      try {
        if (!model) {
          throw new Error('AI model not loaded yet. Please wait or refresh the page.');
        }

        // Create an image element for TensorFlow to analyze
        const img = document.createElement('img');
        img.src = imageUrl;
        img.width = 224;  // MobileNet expects 224x224 images
        img.height = 224;

        // Wait for the image to load
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Classify the image using MobileNet
        const predictions = await model.classify(img);
        console.log('TensorFlow predictions:', predictions);

        // Process the predictions to map them to agricultural waste categories
        const wasteClassification = await processClassification(predictions);
        setClassifiedWaste(wasteClassification);

        // Fetch similar products based on the classified waste type
        fetchSimilarProducts(wasteClassification.type);
      } catch (error) {
        console.error('Error classifying image:', error);
        alert('Failed to classify image: ' + error.message);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  const processClassification = async (predictions) => {
    // Map TensorFlow predictions to agricultural waste categories
    console.log('Processing TensorFlow predictions:', predictions);

    if (!predictions || predictions.length === 0) {
      throw new Error('No predictions received from the AI model');
    }

    // Extract the top prediction
    const topPrediction = predictions[0];

    try {
      // Get waste analysis based on the prediction
      const wasteAnalysis = getWasteAnalysis(topPrediction.className);

      // For now, map common objects to waste categories
      let wasteType = 'Unknown';
      let educationalContent = {
        description: '',
        environmentalImpact: [],
        economicBenefits: [],
        sustainabilityTips: []
      };

      if (topPrediction.className.includes('compost') ||
          topPrediction.className.includes('plant') ||
          topPrediction.className.includes('vegetable') ||
          topPrediction.className.includes('fruit') ||
          topPrediction.className.includes('leaf') ||
          topPrediction.className.includes('hay') ||
          topPrediction.className.includes('straw') ||
          topPrediction.className.includes('crop') ||
          topPrediction.className.includes('residue') ||
          topPrediction.className.includes('husk') ||
          topPrediction.className.includes('shell') ||
          topPrediction.className.includes('peel') ||
          topPrediction.className.includes('pulp') ||
          topPrediction.className.includes('bagasse')) {
        wasteType = 'Organic Waste';
        educationalContent = {
          description: 'Organic agricultural waste is biodegradable material from farming operations.',
          environmentalImpact: [
            'Reduces landfill burden',
            'Natural soil enrichment',
            'Lower greenhouse gas emissions when properly managed'
          ],
          economicBenefits: [
            'Can be converted to compost for additional income',
            'Potential for biogas production',
            'Reduces fertilizer costs when used as soil amendment'
          ],
          sustainabilityTips: [
            'Set up a composting system',
            'Consider biogas digester installation',
            'Use as mulch for water conservation'
          ]
        };
        
        // Add more specific subcategories with detailed information
        if (topPrediction.className.includes('straw') || topPrediction.className.includes('hay')) {
            wasteType = 'Organic - Crop Residue';
            educationalContent.description = 'Crop residues are materials left in field after harvest, including straw and hay.';
            educationalContent.sustainabilityTips.push('Can be used as animal feed or bedding');
        } else if (topPrediction.className.includes('fruit') || topPrediction.className.includes('vegetable')) {
            wasteType = 'Organic - Food Waste';
            educationalContent.description = 'Food waste includes unsold or unusable fruits and vegetables.';
            educationalContent.sustainabilityTips.push('Consider food processing or preservation');
        } else if (topPrediction.className.includes('husk') || topPrediction.className.includes('shell')) {
            wasteType = 'Organic - Processing Waste';
            educationalContent.description = 'Agricultural processing byproducts like husks and shells.';
            educationalContent.sustainabilityTips.push('Can be used for craft materials or biofuel');
        }
      } else if (topPrediction.className.includes('plastic') ||
                topPrediction.className.includes('bottle') ||
                topPrediction.className.includes('container')) {
        wasteType = 'Plastic Waste';
      } else if (topPrediction.className.includes('wood') ||
                topPrediction.className.includes('timber')) {
        wasteType = 'Wood Waste';
      } else if (topPrediction.className.includes('metal') ||
                topPrediction.className.includes('can') ||
                topPrediction.className.includes('aluminum')) {
        wasteType = 'Metal Waste';
      }

      // Format the waste name to be more agriculture-specific
      let wasteName = topPrediction.className;
      if (wasteAnalysis && wasteAnalysis.wasteName) {
        wasteName = wasteAnalysis.wasteName;
      } else {
        // Clean up the class name (remove words after comma and capitalize)
        wasteName = topPrediction.className.split(',')[0];
        wasteName = wasteName.charAt(0).toUpperCase() + wasteName.slice(1) + ' Waste';
      }

      // Price mapping based on standardized waste types
      const prices = {
        'Organic Waste': 120,
        'Plastic Waste': 80,
        'Wood Waste': 150,
        'Metal Waste': 200,
        'Other': 100
      };

      // Create the waste classification result
      return {
        name: wasteName,
        type: wasteType,
        confidence: topPrediction.probability,
        price: prices[wasteType],
        unit: 'kg',
        description: wasteAnalysis?.description || `${wasteName} that can be recycled or repurposed for agricultural use.`,
        possibleUses: wasteAnalysis?.possibleUses || [
          "Recycling",
          "Composting",
          "Energy production"
        ],
        educationalContent
      };
    } catch (error) {
      console.error('Error processing classification:', error);

      // Fallback to a basic classification if API calls fail
      return {
        name: topPrediction.className.split(',')[0],
        type: 'Unknown',
        confidence: topPrediction.probability,
        price: 100,
        unit: 'kg',
        description: `This appears to be ${topPrediction.className.split(',')[0]} that might be useful for agricultural purposes.`,
        possibleUses: [
          "Recycling",
          "Repurposing",
          "Research"
        ]
      };
    }
  };

  const getWasteAnalysis = (objectName) => {
    console.log('Getting waste analysis for:', objectName);

    // Provide analysis based on object name
    const analysis = {
      wasteName: objectName.split(',')[0].charAt(0).toUpperCase() + objectName.split(',')[0].slice(1) + ' Waste',
      description: `This appears to be ${objectName.split(',')[0]} that can be recycled or repurposed for agricultural use.`,
      possibleUses: [
        "Composting",
        "Recycling",
        "Soil amendment",
        "Energy production",
        "Mulching"
      ]
    };

    return analysis;
  };

  const fetchSimilarProducts = async (wasteType) => {
    setIsFetchingSimilar(true);

    try {
      // Check if API URL is configured
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        console.warn('API URL not configured. Using fallback data.');
        return { data: null };
      }

      // Try to fetch similar products from the backend API
      const response = await axios.get(`${apiUrl}/waste/similar`, {
        params: { type: wasteType }
      }).catch(error => {
        console.warn('API call failed, using fallback data:', error);
        return { data: null };
      });

      // If we got a response from the API, use it
      if (response.data && Array.isArray(response.data)) {
        setSimilarProducts(response.data.map(product => ({
          ...product,
          similarity: product.similarity || 0.7 // Ensure similarity exists
        })));
      } else {
        // Fallback to local data if API call fails
        console.log('Using fallback similar products data for type:', wasteType);

        // Fallback data based on waste type
        const fallbackProducts = {
          'Organic': [
            {
              _id: 'waste-001',
              name: 'Corn Stalks',
              type: 'Organic',
              price: 120,
              unit: 'kg',
              image: '/images/waste/corn-stalks.jpg',
              similarity: 0.89
            },
            {
              _id: 'waste-002',
              name: 'Rice Husks',
              type: 'Organic',
              price: 80,
              unit: 'kg',
              image: '/images/waste/rice-husks.jpg',
              similarity: 0.76
            },
            {
              _id: 'waste-003',
              name: 'Wheat Straw',
              type: 'Organic',
              price: 100,
              unit: 'kg',
              image: '/images/waste/wheat-straw.jpg',
              similarity: 0.72
            }
          ],
          'Plastic': [
            {
              _id: 'waste-101',
              name: 'Agricultural Film',
              type: 'Plastic',
              price: 60,
              unit: 'kg',
              image: '/images/waste/agri-film.jpg',
              similarity: 0.85
            },
            {
              _id: 'waste-102',
              name: 'Irrigation Pipes',
              type: 'Plastic',
              price: 90,
              unit: 'kg',
              image: '/images/waste/irrigation-pipes.jpg',
              similarity: 0.78
            }
          ],
          'Wood': [
            {
              _id: 'waste-201',
              name: 'Orchard Prunings',
              type: 'Wood',
              price: 130,
              unit: 'kg',
              image: '/images/waste/prunings.jpg',
              similarity: 0.91
            },
            {
              _id: 'waste-202',
              name: 'Wooden Crates',
              type: 'Wood',
              price: 110,
              unit: 'kg',
              image: '/images/waste/wooden-crates.jpg',
              similarity: 0.82
            }
          ],
          'Metal': [
            {
              _id: 'waste-301',
              name: 'Farm Equipment Parts',
              type: 'Metal',
              price: 180,
              unit: 'kg',
              image: '/images/waste/equipment-parts.jpg',
              similarity: 0.88
            },
            {
              _id: 'waste-302',
              name: 'Metal Containers',
              type: 'Metal',
              price: 150,
              unit: 'kg',
              image: '/images/waste/metal-containers.jpg',
              similarity: 0.75
            }
          ]
        };

        // Get products for the specific waste type, or default to a generic list
        const productsForType = fallbackProducts[wasteType] || [
          {
            _id: 'waste-901',
            name: 'Mixed Agricultural Waste',
            type: 'Unknown',
            price: 70,
            unit: 'kg',
            image: '/images/waste/mixed-waste.jpg',
            similarity: 0.65
          },
          {
            _id: 'waste-902',
            name: 'Recyclable Farm Materials',
            type: 'Unknown',
            price: 85,
            unit: 'kg',
            image: '/images/waste/recyclable-materials.jpg',
            similarity: 0.60
          }
        ];

        setSimilarProducts(productsForType);
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
      setSimilarProducts([]); // Set empty array on error
    } finally {
      setIsFetchingSimilar(false);
    }
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);

    try {
      // Add to cart logic similar to WasteProductDetail.js
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Create a waste product object
      const wasteProduct = {
        _id: `waste-${Date.now()}`, // Generate a temporary ID
        name: classifiedWaste.name,
        price: classifiedWaste.price,
        image: selectedImage,
        category: 'Waste',
        type: classifiedWaste.type,
        quantity: quantity
      };

      existingCart.push(wasteProduct);
      localStorage.setItem('cart', JSON.stringify(existingCart));

      // Update cart badge
      updateCartBadge();

      alert('Waste product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add waste product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    // Navigate to checkout with the waste product
    const wasteProduct = {
      _id: `waste-${Date.now()}`, // Generate a temporary ID
      name: classifiedWaste.name,
      price: classifiedWaste.price,
      image: selectedImage,
      category: 'Waste',
      type: classifiedWaste.type,
      isWasteProduct: true
    };

    navigate('/checkout', {
      state: {
        product: wasteProduct,
        quantity: quantity
      }
    });
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      alert('Please select a rating before submitting feedback.');
      return;
    }

    const feedbackData = {
      wasteId: classifiedWaste?._id || `waste-${Date.now()}`,
      wasteName: classifiedWaste?.name || 'Unknown',
      wasteType: classifiedWaste?.type || 'Unknown',
      rating: feedbackRating,
      comment: userFeedback,
      timestamp: new Date().toISOString()
    };

    try {
      // Check if API URL is configured
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        console.warn('API URL not configured. Logging feedback locally.');
        console.log('Feedback submitted (local fallback):', feedbackData);
      } else {
        // Try to send feedback to the backend API
        await axios.post(`${apiUrl}/feedback/waste-classifier`, feedbackData)
          .catch(error => {
            console.warn('API call failed, logging feedback locally:', error);
            // If API call fails, log the feedback to console
            console.log('Feedback submitted (local fallback):', feedbackData);
            return { data: { success: true } };
          });
      }

      // Show success message
      setFeedbackSubmitted(true);

      // Store feedback in localStorage for analytics
      try {
        const storedFeedback = JSON.parse(localStorage.getItem('waste_classifier_feedback') || '[]');
        storedFeedback.push(feedbackData);
        localStorage.setItem('waste_classifier_feedback', JSON.stringify(storedFeedback));
      } catch (storageError) {
        console.error('Error storing feedback in localStorage:', storageError);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setUserFeedback('');
        setFeedbackRating(0);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleSimilarProductClick = (product) => {
    // Set the selected product as the classified waste
    setClassifiedWaste({
      ...product,
      confidence: product.similarity,
      description: `${product.name} suitable for various agricultural applications.`,
      possibleUses: [
        "Composting",
        "Soil amendment",
        "Biogas production"
      ]
    });
  };

  // Function to test the classifier with sample images (for development purposes)
  const testWithSampleImage = async (imageType) => {
    setIsClassifying(true);

    try {
      // Sample test images for different agricultural waste types
      const sampleImages = {
        organic: '/images/samples/crop-residue.jpg',  // Image of crop residues like straw or corn stalks
        plastic: '/images/samples/agri-plastic.jpg',  // Image of agricultural plastic waste like mulch films
        wood: '/images/samples/pruning-waste.jpg',    // Image of tree pruning and orchard waste
        metal: '/images/samples/farm-metal.jpg'       // Image of old farm equipment or metal containers
      };

      // Realistic fallback images for agricultural waste
      const fallbackImages = {
        organic: 'https://images.unsplash.com/photo-1530176611600-d09e936e3c86?auto=format&fit=crop&w=400&h=400',  // Crop residue/straw
        plastic: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=400&h=400',  // Agricultural plastic waste
        wood: 'https://images.unsplash.com/photo-1595587637401-83ff5613c0da?auto=format&fit=crop&w=400&h=400',    // Wood waste/prunings
        metal: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&w=400&h=400'       // Farm equipment/metal
      };

      // Try to use the sample image, but check if it exists first
      let imageUrl = sampleImages[imageType] || sampleImages.organic;

      // Create an image element to test if the sample image exists
      const testImg = new Image();
      testImg.onerror = () => {
        console.warn(`Sample image ${imageUrl} not found, using fallback image`);
        imageUrl = fallbackImages[imageType] || fallbackImages.organic;
        setSelectedImage(imageUrl);
      };
      testImg.onload = () => {
        setSelectedImage(imageUrl);
      };
      testImg.src = imageUrl;

      // Create an image element for TensorFlow
      const img = document.createElement('img');
      img.src = imageUrl;
      img.width = 224;
      img.height = 224;

      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // If model is loaded, use it for classification
      if (model) {
        const predictions = await model.classify(img);
        const wasteClassification = await processClassification(predictions);
        setClassifiedWaste(wasteClassification);
        fetchSimilarProducts(wasteClassification.type);
      } else {
        // Fallback if model isn't loaded
        console.warn('Model not loaded, using fallback classification');
        const fallbackTypes = {
          organic: 'Organic',
          plastic: 'Plastic',
          wood: 'Wood',
          metal: 'Metal'
        };

        const fallbackNames = {
          organic: 'Crop Residue',
          plastic: 'Agricultural Film',
          wood: 'Orchard Prunings',
          metal: 'Farm Equipment Parts'
        };

        const fallbackClassification = {
          name: fallbackNames[imageType] || 'Agricultural Waste',
          type: fallbackTypes[imageType] || 'Unknown',
          confidence: 0.85,
          price: 100,
          unit: 'kg',
          description: `${fallbackNames[imageType] || 'Agricultural waste'} that can be recycled or repurposed.`,
          possibleUses: [
            "Recycling",
            "Composting",
            "Energy production"
          ]
        };

        setClassifiedWaste(fallbackClassification);
        fetchSimilarProducts(fallbackClassification.type);
      }
    } catch (error) {
      console.error('Error testing with sample image:', error);
      alert('Failed to test with sample image: ' + error.message);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="waste-classifier">
      <h2>AI Waste Classifier</h2>
      <p>Upload an image of agricultural waste to get AI-powered classification and recycling recommendations.</p>

      {!selectedImage ? (
        <div className="upload-section">
          {isModelLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading model...</span>
              </div>
              <p className="mt-3">Loading AI model...</p>
            </div>
          ) : (
            <>
              <label htmlFor="waste-image" className="upload-label">
                <i className="bi bi-cloud-upload"></i>
                <span>Upload Waste Image</span>
              </label>
              <input
                type="file"
                id="waste-image"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              <div className="placeholder-message mt-4">
                <i className="bi bi-info-circle"></i>
                <p>Our AI model can identify various types of agricultural waste.</p>
                <p>For best results, ensure the waste is clearly visible in the image.</p>
              </div>

              {/* Test buttons for development - can be removed in production */}
              <div className="test-buttons mt-4 text-center">
                <p className="text-muted small mb-2">For testing purposes:</p>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => testWithSampleImage('organic')}
                >
                  Test: Organic
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => testWithSampleImage('plastic')}
                >
                  Test: Plastic
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => testWithSampleImage('wood')}
                >
                  Test: Wood
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => testWithSampleImage('metal')}
                >
                  Test: Metal
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="classification-results">
          <div className="row">
            <div className="col-md-6">
              <div className="image-preview mb-3">
                <img
                  ref={imageRef}
                  src={selectedImage}
                  alt="Waste"
                  className="img-fluid rounded"
                />
              </div>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setSelectedImage(null);
                  setClassifiedWaste(null);
                  setSimilarProducts([]);
                }}
              >
                <i className="bi bi-arrow-left me-1"></i> Upload Different Image
              </button>
            </div>

            <div className="col-md-6">
              {isClassifying ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Classifying...</span>
                  </div>
                  <p className="mt-3">Analyzing waste image with AI...</p>
                </div>
              ) : classifiedWaste ? (
                <div className="waste-details">
                  <h4>{classifiedWaste.name}</h4>
                  <div className="mb-3">
                    <span className="badge bg-success me-2">{classifiedWaste.type}</span>
                    <span className="text-muted">Confidence: {(classifiedWaste.confidence * 100).toFixed(1)}%</span>
                  </div>

                  <h5 className="text-success mb-3">₹{classifiedWaste.price}/{classifiedWaste.unit}</h5>

                  <p>{classifiedWaste.description}</p>

                  {classifiedWaste.possibleUses && (
                    <div className="mb-3">
                      <h6>Possible Uses:</h6>
                      <ul className="list-group list-group-flush">
                        {classifiedWaste.possibleUses.map((use, index) => (
                          <li key={index} className="list-group-item bg-transparent ps-0">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {use}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {classifiedWaste.educationalContent && (
                    <div className="educational-content mt-4">
                      <h6>Educational Content:</h6>
                      <p>{classifiedWaste.educationalContent.description}</p>
                      <div>
                        <h6>Environmental Impact:</h6>
                        <ul>
                          {classifiedWaste.educationalContent.environmentalImpact.map((impact, index) => (
                            <li key={index}>{impact}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6>Economic Benefits:</h6>
                        <ul>
                          {classifiedWaste.educationalContent.economicBenefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6>Sustainability Tips:</h6>
                        <ul>
                          {classifiedWaste.educationalContent.sustainabilityTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Buying Options */}
                  <div className="buying-options mt-4">
                    <div className="d-flex align-items-center mb-3">
                      <label htmlFor="quantity" className="me-3">Quantity:</label>
                      <div className="input-group" style={{ width: '120px' }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="quantity"
                          className="form-control text-center"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setQuantity(prev => prev + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Adding...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cart-plus me-2"></i>
                            Add to Cart
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={handleBuyNow}
                      >
                        <i className="bi bi-lightning-fill me-2"></i>
                        Buy Now
                      </button>
                    </div>
                  </div>

                  {/* User Feedback Section */}
                  <div className="feedback-section mt-4 pt-3 border-top">
                    <h6>How accurate was this classification?</h6>
                    {feedbackSubmitted ? (
                      <div className="alert alert-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Thank you for your feedback!
                      </div>
                    ) : (
                      <>
                        <div className="rating mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`bi ${feedbackRating >= star ? 'bi-star-fill' : 'bi-star'} me-1`}
                              style={{ cursor: 'pointer', color: feedbackRating >= star ? '#ffc107' : '#ccc' }}
                              onClick={() => setFeedbackRating(star)}
                            ></i>
                          ))}
                        </div>
                        <div className="form-group mb-2">
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Additional comments (optional)"
                            value={userFeedback}
                            onChange={(e) => setUserFeedback(e.target.value)}
                          ></textarea>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleFeedbackSubmit}
                        >
                          Submit Feedback
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-5">
                  <p>No classification results available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="similar-products mt-4">
              <h4 className="mb-3">Similar Waste Products</h4>
              {isFetchingSimilar ? (
                <div className="text-center p-3">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Finding similar products...</span>
                </div>
              ) : (
                <div className="row">
                  {similarProducts.map((product) => (
                    <div key={product._id} className="col-md-4 mb-3">
                      <div
                        className="card h-100 border-0 shadow-sm product-card"
                        onClick={() => handleSimilarProductClick(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-2">
                            <div className="flex-shrink-0">
                              {/* Use a placeholder image if the actual image is not available */}
                              <img
                                src={product.image || 'https://via.placeholder.com/50'}
                                alt={product.name}
                                className="rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-0">{product.name}</h6>
                              <div>
                                <span className="badge bg-light text-dark me-1">{product.type}</span>
                                <small className="text-muted">
                                  {(product.similarity * 100).toFixed(0)}% match
                                </small>
                              </div>
                            </div>
                          </div>
                          <div className="text-success fw-bold">₹{product.price}/{product.unit}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WasteClassifier;