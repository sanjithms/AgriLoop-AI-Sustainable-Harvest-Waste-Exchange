const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import the WasteManagement model
const WasteManagement = require('../models/WasteManagement');

// Sample data
const wasteManagementData = [
  {
    title: 'Rice Straw Management',
    description: 'Rice straw is a valuable agricultural byproduct that can be transformed into multiple value-added products through proper processing and management techniques.',
    methods: [
      'Composting',
      'Mushroom cultivation',
      'Biofuel production',
      'Animal bedding',
      'Paper making'
    ],
    wasteType: 'Crop Residue',
    composition: {
      moisture: 12,
      nitrogen: 0.6,
      phosphorus: 0.1,
      potassium: 1.5,
      organicMatter: 80,
      carbonContent: 42
    },
    potentialApplications: [
      {
        name: 'Mushroom Cultivation',
        description: 'Using rice straw as a substrate for growing oyster and straw mushrooms',
        marketValue: 'High',
        implementationComplexity: 'Moderate'
      },
      {
        name: 'Bioethanol Production',
        description: 'Converting rice straw into bioethanol through enzymatic hydrolysis',
        marketValue: 'Very High',
        implementationComplexity: 'Complex'
      },
      {
        name: 'Organic Fertilizer',
        description: 'Composting rice straw for nutrient-rich fertilizer',
        marketValue: 'Medium',
        implementationComplexity: 'Easy'
      }
    ],
    environmentalBenefits: [
      {
        benefit: 'Reduced Air Pollution',
        impact: 'Prevents release of greenhouse gases and particulate matter from straw burning'
      },
      {
        benefit: 'Soil Health Improvement',
        impact: 'Enhances soil organic matter content and structure when used as compost'
      }
    ],
    processingMethods: [
      {
        method: 'Composting',
        description: 'Aerobic decomposition of rice straw mixed with other organic materials',
        requiredEquipment: ['Shredder', 'Composting bins', 'Temperature probes', 'Moisture meters'],
        estimatedCost: 25000,
        estimatedROI: '6-8 months'
      },
      {
        method: 'Mushroom Cultivation',
        description: 'Sterilization and inoculation of rice straw for mushroom growing',
        requiredEquipment: ['Sterilization chamber', 'Inoculation tools', 'Humidity control system'],
        estimatedCost: 50000,
        estimatedROI: '4-6 months'
      }
    ],
    successStories: [
      {
        title: 'Community Mushroom Enterprise',
        description: 'Farmer cooperative in Punjab successfully converted rice straw waste into profitable mushroom cultivation business',
        location: 'Punjab, India',
        impact: 'Generated additional income of ₹30,000 per month for 20 farmers',
        yearImplemented: 2024
      }
    ],
    guidelines: [
      {
        step: 'Collection and Storage',
        description: 'Proper collection and storage of rice straw after harvest',
        bestPractices: [
          'Collect straw within 2 days of harvest',
          'Store in covered area with good ventilation',
          'Maintain moisture content below 15%'
        ]
      }
    ]
  },
  {
    title: 'Agricultural Plastic Waste Management',
    description: 'Effective management and recycling of agricultural plastic waste including mulch films, irrigation pipes, and packaging materials.',
    methods: [
      'Mechanical recycling',
      'Chemical recycling',
      'Upcycling',
      'Energy recovery'
    ],
    wasteType: 'Packaging Waste',
    composition: {
      moisture: 2,
      organicMatter: 95,
      carbonContent: 85
    },
    potentialApplications: [
      {
        name: 'Recycled Agricultural Products',
        description: 'Converting waste plastics into new agricultural products like plant pots and trays',
        marketValue: 'High',
        implementationComplexity: 'Moderate'
      },
      {
        name: 'Alternative Fuel',
        description: 'Processing non-recyclable plastics into refuse-derived fuel',
        marketValue: 'Medium',
        implementationComplexity: 'Complex'
      }
    ],
    environmentalBenefits: [
      {
        benefit: 'Reduced Plastic Pollution',
        impact: 'Prevents plastic accumulation in agricultural soils and water bodies'
      },
      {
        benefit: 'Resource Conservation',
        impact: 'Reduces demand for virgin plastic materials through recycling'
      }
    ],
    processingMethods: [
      {
        method: 'Mechanical Recycling',
        description: 'Sorting, washing, shredding, and pelletizing of agricultural plastics',
        requiredEquipment: ['Plastic shredder', 'Washing system', 'Pelletizing machine'],
        estimatedCost: 150000,
        estimatedROI: '12-18 months'
      }
    ],
    successStories: [
      {
        title: 'Agricultural Plastic Recycling Initiative',
        description: 'Establishment of local recycling facility for agricultural plastics',
        location: 'Maharashtra, India',
        impact: 'Recycled over 500 tons of agricultural plastic waste in first year',
        yearImplemented: 2024
      }
    ],
    guidelines: [
      {
        step: 'Segregation',
        description: 'Proper segregation of different types of agricultural plastics',
        bestPractices: [
          'Separate different types of plastics',
          'Remove soil and organic contamination',
          'Store in designated collection points'
        ]
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await WasteManagement.deleteMany({});
    console.log('Cleared existing waste management data...');

    // Insert new data
    await WasteManagement.insertMany(wasteManagementData);
    console.log('Successfully seeded waste management data!');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB...');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();