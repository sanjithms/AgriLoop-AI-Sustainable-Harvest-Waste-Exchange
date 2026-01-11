const mongoose = require('mongoose');

const wasteProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the waste product'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  type: {
    type: String,
    required: [true, 'Please specify waste type'],
    enum: ['Crop Residue', 'Animal Waste', 'Processing Waste', 'Organic Waste', 'Other']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify quantity available']
  },
  unit: {
    type: String,
    required: [true, 'Please specify unit of measurement'],
    enum: ['kg', 'ton', 'liters', 'pieces']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  location: {
    type: String,
    required: [true, 'Please provide pickup location']
  },
  images: [String],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  possibleUses: [String],
  nutrientContent: {
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organic: Number
  },
  certifications: [String],
  pickupDetails: {
    address: String,
    contactPerson: String,
    phone: String,
    availableDays: [String],
    instructions: String
  }
}, { timestamps: true });

// Add text index for search functionality
wasteProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  type: 'text',
  possibleUses: 'text'
});

module.exports = mongoose.model('WasteProduct', wasteProductSchema);