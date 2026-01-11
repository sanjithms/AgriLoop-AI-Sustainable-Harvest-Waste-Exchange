require('dotenv').config();

/**
 * Get information about agricultural waste
 * Note: This service uses static data rather than OpenAI API
 * @param {string} wasteName - The name of the waste product
 * @returns {Promise<Object>} - Structured waste information
 */
const getWasteInfo = async (wasteName) => {
  try {
    console.log(`Requesting waste information for: ${wasteName}`);
    return getWasteInfoData(wasteName);
  } catch (error) {
    console.error("Error in waste info service:", error);
    return getWasteInfoData(wasteName);
  }
};

/**
 * Get information about agricultural waste
 * @param {string} wasteName - The name of the waste product
 * @returns {Object} - Structured waste information
 */
const getWasteInfoData = (wasteName) => {
  console.log(`Getting data for: ${wasteName}`);

  // Generic data
  const genericData = {
    "waste_name": wasteName,
    "uses": "1. Composting: Can be used to create nutrient-rich soil amendments.\n2. Biofuel production: Can be converted into biogas or other biofuels.\n3. Animal feed: May be processed for livestock consumption if suitable.\n4. Mulching: Can be used as mulch for soil protection and moisture retention.",
    "process": "1. Collection: Gather and sort the waste material.\n2. Pre-processing: Clean and prepare the waste by removing contaminants.\n3. Processing: Apply appropriate methods such as shredding, composting, or fermentation.\n4. Post-processing: Package or prepare the processed material for its intended use.",
    "market_value": "The market value varies by region and quality. Generally, processed agricultural waste can fetch between ₹500-2000 per ton depending on the type and quality. Value-added products like compost can sell for ₹5-15 per kg in retail markets.",
    "environmental_impact": "Recycling agricultural waste reduces greenhouse gas emissions from decomposition, prevents water and soil pollution, conserves landfill space, and returns nutrients to the soil when used as compost or fertilizer.",
    "challenges": "1. Collection and transportation costs\n2. Seasonal availability\n3. Contamination issues\n4. Processing technology limitations\n5. Market fluctuations and demand uncertainty",
    "success_stories": "1. Farmers in Punjab have successfully converted rice straw into biogas instead of burning it, reducing air pollution.\n2. A cooperative in Maharashtra converts sugarcane waste into packaging materials, creating local jobs.\n3. Several villages in Tamil Nadu use coconut waste for crafts and fuel, creating sustainable livelihoods."
  };

  // Specific data for common waste types
  const specificData = {
    "rice husk": {
      "waste_name": "Rice Husk",
      "uses": "1. Silica extraction for industrial applications\n2. Fuel for biomass power plants\n3. Bedding material for poultry and livestock\n4. Substrate for mushroom cultivation\n5. Soil amendment to improve drainage",
      "process": "1. Collection from rice mills\n2. Cleaning and sorting to remove impurities\n3. Processing through grinding or burning depending on end use\n4. For silica extraction, controlled burning followed by chemical processing\n5. For fuel, compressing into briquettes or direct use in specialized furnaces",
      "market_value": "Raw rice husks sell for ₹2-5 per kg. Processed rice husk ash with high silica content can fetch ₹15-30 per kg. Rice husk briquettes sell for ₹8-12 per kg in the biofuel market.",
      "environmental_impact": "Utilizing rice husks prevents open burning which reduces air pollution and greenhouse gas emissions. When used as a soil amendment, it improves soil structure and reduces the need for chemical fertilizers.",
      "challenges": "1. High silica content makes it resistant to decomposition\n2. Transportation costs due to low density\n3. Ash disposal when used as fuel\n4. Seasonal availability tied to rice harvesting\n5. Variable quality affecting industrial applications",
      "success_stories": "1. A company in Haryana converts rice husks into silica for use in tire manufacturing\n2. Several villages in Bihar use rice husk gasifiers for electricity generation\n3. Farmers in Tamil Nadu use rice husk ash as a potassium-rich fertilizer, reducing chemical inputs"
    },
    "sugarcane bagasse": {
      "waste_name": "Sugarcane Bagasse",
      "uses": "1. Pulp for paper production\n2. Fuel for cogeneration in sugar mills\n3. Feedstock for bioethanol production\n4. Fiberboard and particle board manufacturing\n5. Biodegradable packaging and disposable tableware",
      "process": "1. Collection after juice extraction in sugar mills\n2. Drying to reduce moisture content\n3. For paper, pulping through chemical or mechanical processes\n4. For biofuel, enzymatic hydrolysis followed by fermentation\n5. For building materials, mixing with resins and pressing under heat",
      "market_value": "Raw bagasse sells for ₹1,000-2,000 per ton. Bagasse-based paper products command a premium of 10-20% over conventional paper. Bagasse boards sell for ₹30-50 per square foot depending on thickness and quality.",
      "environmental_impact": "Using bagasse reduces deforestation pressure for paper and building materials. As a biofuel, it is carbon-neutral and reduces fossil fuel consumption. Bagasse-based products are biodegradable and compostable.",
      "challenges": "1. Seasonal availability tied to sugar production\n2. High moisture content requiring drying\n3. Storage challenges due to bulk and fermentation risk\n4. Competition with other uses within sugar mills\n5. Processing technology costs for small-scale operations",
      "success_stories": "1. A major paper company in Maharashtra produces premium writing paper from bagasse\n2. Sugar mills in Uttar Pradesh generate surplus electricity from bagasse cogeneration\n3. An entrepreneur in Karnataka produces biodegradable food containers from bagasse, supplying to restaurant chains"
    }
  };

  // Check if we have specific data for this waste type
  const lowerCaseWasteName = wasteName.toLowerCase();
  for (const [key, data] of Object.entries(specificData)) {
    if (lowerCaseWasteName.includes(key)) {
      return data;
    }
  }

  // Return generic data if no specific match
  return genericData;
};

// Export functions
module.exports = {
  getWasteInfo,
  getWasteInfoData
};