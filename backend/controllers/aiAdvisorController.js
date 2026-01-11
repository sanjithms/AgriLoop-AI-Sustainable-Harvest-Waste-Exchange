require('dotenv').config();

/**
 * Get advice for a specific topic and query
 * @param {string} topic - The topic of the query
 * @param {string} query - The user's query
 * @returns {string} - Advice
 */
const getAdvice = (topic, query) => {
  console.log(`Generating advice for topic: ${topic}, query: ${query}`);

  // Generic responses by topic
  const responses = {
    crop: `Thank you for your question about crop management: "${query}"\n\nFor optimal crop selection and management, consider these key principles:\n\n1. Understand your local climate and soil conditions before selecting crops.\n\n2. Practice crop rotation to prevent soil depletion and reduce pest pressure.\n\n3. Choose varieties that are well-adapted to your region and have resistance to common local diseases.\n\n4. Consider market demand and pricing trends when selecting commercial crops.\n\n5. Implement integrated pest management to reduce reliance on chemical pesticides.\n\nFor more specific advice, consult your local agricultural extension office or agricultural university.`,

    pest: `Thank you for your question about pest management: "${query}"\n\nHere are some sustainable approaches to pest management:\n\n1. Prevention: Use healthy seeds, resistant varieties, and proper spacing to prevent pest problems before they start.\n\n2. Monitoring: Regularly inspect your crops to catch pest issues early.\n\n3. Biological controls: Encourage beneficial insects like ladybugs and lacewings that prey on common pests.\n\n4. Cultural practices: Rotate crops, adjust planting times, and remove crop residues to disrupt pest life cycles.\n\n5. Minimal chemical intervention: If pesticides are necessary, choose the least toxic options and apply them precisely when and where needed.\n\nRemember that a healthy ecosystem on your farm is your best defense against serious pest outbreaks.`,

    soil: `Thank you for your question about soil health: "${query}"\n\nMaintaining healthy soil is fundamental to sustainable agriculture. Here are key principles:\n\n1. Regular soil testing: Understand your soil's pH, nutrient levels, and organic matter content.\n\n2. Organic matter management: Add compost, green manures, and crop residues to build soil structure and fertility.\n\n3. Minimize tillage: Reduce soil disturbance to protect soil structure and beneficial organisms.\n\n4. Cover cropping: Keep soil covered to prevent erosion and add organic matter.\n\n5. Balanced fertilization: Apply nutrients based on soil tests and crop needs to avoid deficiencies or excesses.\n\nHealthy soil leads to resilient crops, reduced input costs, and sustainable productivity.`,

    water: `Thank you for your question about water management: "${query}"\n\nEfficient water management is increasingly critical in agriculture. Consider these approaches:\n\n1. Irrigation scheduling: Water based on crop needs and soil moisture levels, not fixed schedules.\n\n2. Irrigation system selection: Choose systems appropriate for your crops, soil, and water availability (drip irrigation is often most efficient).\n\n3. Soil moisture monitoring: Use tools like tensiometers or moisture sensors to optimize irrigation timing.\n\n4. Water conservation practices: Implement mulching, contour farming, and windbreaks to reduce water loss.\n\n5. Water harvesting: Consider collecting rainwater and runoff for supplemental irrigation.\n\nRemember that both under-watering and over-watering can reduce yields and quality.`,

    market: `Thank you for your question about agricultural markets: "${query}"\n\nSuccessful agricultural marketing requires strategic planning:\n\n1. Market research: Understand demand trends, price patterns, and competition before committing to production.\n\n2. Diversification: Consider multiple crops or products to spread risk and access different markets.\n\n3. Value addition: Process or package your products to capture more of the final value.\n\n4. Direct marketing: Explore farmers markets, CSAs, or direct-to-restaurant sales to increase margins.\n\n5. Cooperative approaches: Consider joining or forming a producer group to access larger markets and share resources.\n\nStay informed about market trends and be prepared to adapt your production and marketing strategies accordingly.`,

    tech: `Thank you for your question about agricultural technology: "${query}"\n\nModern agricultural technology offers many opportunities to improve efficiency and sustainability:\n\n1. Precision agriculture: GPS-guided equipment, variable rate application, and field mapping can optimize inputs and reduce waste.\n\n2. Sensors and monitoring: Soil moisture sensors, weather stations, and crop monitoring tools provide data for better decision-making.\n\n3. Farm management software: Digital tools can help track operations, inputs, yields, and finances.\n\n4. Appropriate mechanization: Select equipment scaled appropriately for your operation to improve efficiency without excessive capital costs.\n\n5. Connectivity solutions: Even in remote areas, various technologies can help maintain internet access for information and services.\n\nFocus on technologies that address your specific challenges and offer clear returns on investment.`
  };

  // Default response if topic is not recognized
  const defaultResponse = `Thank you for your question: "${query}"\n\nFor the most accurate agricultural advice, I recommend consulting with your local agricultural extension office or agricultural university. They can provide guidance specific to your region, climate, and conditions.\n\nIn general, successful farming practices include:\n\n1. Understanding your local environment and soil conditions\n\n2. Selecting appropriate crops and varieties for your region\n\n3. Implementing integrated pest management\n\n4. Practicing sustainable soil management\n\n5. Staying informed about market trends and opportunities\n\nThese institutions can also connect you with resources, training programs, and possibly financial assistance for implementing best practices.`;

  return responses[topic] || defaultResponse;
};

/**
 * Get sources for a specific topic
 * @param {string} topic - The topic of the query
 * @returns {Array} - Array of source objects
 */
const getSources = (topic) => {
  // Common sources for all topics
  const commonSources = [
    {
      title: "Indian Agricultural Research Institute",
      url: "https://www.iari.res.in/"
    },
    {
      title: "National Institute of Agricultural Extension Management",
      url: "https://www.manage.gov.in/"
    }
  ];

  // Topic-specific sources
  const topicSources = {
    crop: [
      {
        title: "Indian Council of Agricultural Research - Crop Science Division",
        url: "https://icar.org.in/crop-science"
      }
    ],
    pest: [
      {
        title: "National Centre for Integrated Pest Management",
        url: "https://www.ncipm.org.in/"
      }
    ],
    soil: [
      {
        title: "Indian Society of Soil Science",
        url: "https://www.isss-india.org/"
      }
    ],
    water: [
      {
        title: "Central Water Commission",
        url: "http://cwc.gov.in/"
      }
    ],
    market: [
      {
        title: "Agricultural Marketing Information Network",
        url: "https://agmarknet.gov.in/"
      }
    ],
    tech: [
      {
        title: "Digital India Corporation - Agriculture",
        url: "https://dic.gov.in/"
      }
    ]
  };

  // Combine common sources with topic-specific sources
  return [...commonSources, ...(topicSources[topic] || [])];
};

/**
 * Get agricultural advice
 */
exports.getAdvice = async (req, res) => {
  try {
    const { query, topic } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    console.log(`Processing advice request for topic: ${topic}, query: ${query}`);

    const answer = getAdvice(topic, query);
    const sources = getSources(topic);

    return res.status(200).json({
      success: true,
      data: {
        answer,
        sources
      },
      message: 'Advice generated successfully'
    });

  } catch (error) {
    console.error('Error in getAdvice controller:', error);

    // Provide fallback advice in case of error
    const answer = getAdvice(req.body.topic || 'general', req.body.query || 'advice');

    return res.status(200).json({
      success: true,
      data: {
        answer,
        sources: getSources(req.body.topic || 'general')
      },
      message: 'Advice generated due to error'
    });
  }
};