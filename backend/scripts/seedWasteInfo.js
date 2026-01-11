const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WasteInfo = require('../models/WasteInfo');

const wasteInfoData = [
  {
    waste_name: "Rice Straw",
    category: "Crop Residue",
    composition: {
      moisture: 12,
      organic_matter: 85,
      nitrogen: 0.6,
      phosphorus: 0.1,
      potassium: 1.5,
      carbon_content: 42
    },
    uses: [
      {
        application: "Mushroom Cultivation",
        description: "Substrate for growing oyster and straw mushrooms",
        technology_required: "Sterilization chamber, humidity control system",
        estimated_roi: "4-6 months",
        market_value: "High"
      },
      {
        application: "Bioethanol Production",
        description: "Conversion to bioethanol through enzymatic hydrolysis",
        technology_required: "Enzymatic hydrolysis unit, fermentation tanks",
        estimated_roi: "12-18 months",
        market_value: "Very High"
      },
      {
        application: "Animal Feed",
        description: "Processing into nutritious animal feed through treatment",
        technology_required: "Feed processing unit",
        estimated_roi: "3-4 months",
        market_value: "Medium"
      }
    ],
    process: "Collection, shredding, and processing based on end application",
    processing_methods: [
      {
        method: "Composting",
        description: "Aerobic decomposition with other organic materials",
        equipment_needed: ["Shredder", "Composting bins", "Temperature probes"],
        complexity: "Low",
        estimated_cost: 25000
      },
      {
        method: "Enzymatic Treatment",
        description: "Treatment with enzymes for bioethanol production",
        equipment_needed: ["Hydrolysis tanks", "Enzyme dosing system", "Fermentation units"],
        complexity: "High",
        estimated_cost: 150000
      }
    ],
    market_value: "₹1,000-5,000 per ton (raw), ₹15,000-25,000 per ton (processed)",
    environmental_benefits: [
      {
        benefit: "Reduced Air Pollution",
        impact: "Prevents release of greenhouse gases from burning",
        metrics: "1 ton of straw burning releases 3 kg of particulate matter"
      },
      {
        benefit: "Soil Health Improvement",
        impact: "Enhances soil organic matter when composted",
        metrics: "Can improve soil organic carbon by 0.2-0.5% annually"
      }
    ],
    best_practices: [
      {
        practice: "Proper Collection",
        description: "Timely collection and storage of rice straw after harvest",
        implementation_steps: [
          "Collect within 2 days of harvest",
          "Store in covered area",
          "Maintain moisture below 15%"
        ]
      }
    ],
    case_studies: [
      {
        title: "Community Mushroom Enterprise",
        location: "Punjab, India",
        implementation_year: 2024,
        success_metrics: "₹30,000 monthly income for 20 farmers",
        challenges_faced: "Initial resistance to new technology",
        solutions_applied: "Community training programs and demonstration units"
      }
    ],
    resources: [
      {
        title: "Rice Straw Management Guide",
        type: "Guide",
        url: "https://example.com/rice-straw-guide",
        description: "Comprehensive guide on rice straw utilization"
      }
    ]
  },
  {
    waste_name: "Sugarcane Bagasse",
    category: "Processing Waste",
    composition: {
      moisture: 50,
      organic_matter: 95,
      nitrogen: 0.25,
      phosphorus: 0.07,
      potassium: 0.3,
      carbon_content: 45
    },
    uses: [
      {
        application: "Paper Production",
        description: "Manufacturing of eco-friendly paper and packaging",
        technology_required: "Pulping unit, paper making machinery",
        estimated_roi: "18-24 months",
        market_value: "High"
      },
      {
        application: "Bioelectricity",
        description: "Power generation through efficient combustion",
        technology_required: "Steam boiler, turbine generator",
        estimated_roi: "24-36 months",
        market_value: "Very High"
      }
    ],
    process: "Dewatering, size reduction, and processing based on application",
    processing_methods: [
      {
        method: "Pulping",
        description: "Conversion into paper pulp",
        equipment_needed: ["Pulper", "Screening equipment", "Bleaching unit"],
        complexity: "High",
        estimated_cost: 200000
      }
    ],
    market_value: "₹2,000-3,000 per ton (raw), ₹20,000-30,000 per ton (processed)",
    environmental_benefits: [
      {
        benefit: "Renewable Energy",
        impact: "Clean power generation",
        metrics: "1 ton can generate 100-150 kWh of electricity"
      }
    ],
    best_practices: [
      {
        practice: "Moisture Management",
        description: "Proper dewatering and storage",
        implementation_steps: [
          "Mechanical dewatering",
          "Covered storage",
          "Regular moisture monitoring"
        ]
      }
    ],
    case_studies: [
      {
        title: "Integrated Sugar Mill Power Generation",
        location: "Maharashtra, India",
        implementation_year: 2023,
        success_metrics: "100% power self-sufficiency achieved",
        challenges_faced: "High initial investment",
        solutions_applied: "Phased implementation approach"
      }
    ],
    resources: [
      {
        title: "Bagasse to Bioenergy",
        type: "Research Paper",
        url: "https://example.com/bagasse-energy",
        description: "Research on efficient bagasse utilization"
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
    await WasteInfo.deleteMany({});
    console.log('Cleared existing waste info data...');

    // Insert new data
    await WasteInfo.insertMany(wasteInfoData);
    console.log('Successfully seeded waste info data!');

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