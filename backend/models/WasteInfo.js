const mongoose = require('mongoose');

const wasteInfoSchema = new mongoose.Schema({
  waste_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Crop Residue', 'Animal Waste', 'Processing Waste', 'Organic Waste', 'Other']
  },
  composition: {
    moisture: Number,
    organic_matter: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    carbon_content: Number
  },
  uses: [{
    application: String,
    description: String,
    technology_required: String,
    estimated_roi: String,
    market_value: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High']
    }
  }],
  process: {
    type: String,
    required: true
  },
  processing_methods: [{
    method: String,
    description: String,
    equipment_needed: [String],
    complexity: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    estimated_cost: Number
  }],
  market_value: {
    type: String,
    required: true
  },
  environmental_benefits: [{
    benefit: String,
    impact: String,
    metrics: String
  }],
  best_practices: [{
    practice: String,
    description: String,
    implementation_steps: [String]
  }],
  case_studies: [{
    title: String,
    location: String,
    implementation_year: Number,
    success_metrics: String,
    challenges_faced: String,
    solutions_applied: String
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['Guide', 'Video', 'Research Paper', 'Tool', 'Website']
    },
    url: String,
    description: String
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updated_at' field on save
wasteInfoSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const WasteInfo = mongoose.model('WasteInfo', wasteInfoSchema);

module.exports = WasteInfo;