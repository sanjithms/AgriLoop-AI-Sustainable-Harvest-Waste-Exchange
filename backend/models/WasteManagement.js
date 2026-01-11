const mongoose = require("mongoose");

const WasteManagementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    methods: [String], // List of waste conversion methods
    image: { type: String }, // Optional image
    wasteType: {
        type: String,
        required: true,
        enum: ['Organic Waste', 'Plastic Waste', 'Wood Waste', 'Metal Waste', 'Other']
    },
    composition: {
        moisture: Number,
        nitrogen: Number,
        phosphorus: Number,
        potassium: Number,
        organicMatter: Number,
        carbonContent: Number
    },
    potentialApplications: [{
        name: String,
        description: String,
        marketValue: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Very High']
        },
        implementationComplexity: {
            type: String,
            enum: ['Easy', 'Moderate', 'Complex']
        }
    }],
    environmentalBenefits: [{
        benefit: String,
        impact: String
    }],
    processingMethods: [{
        method: String,
        description: String,
        requiredEquipment: [String],
        estimatedCost: Number,
        estimatedROI: String
    }],
    successStories: [{
        title: String,
        description: String,
        location: String,
        impact: String,
        yearImplemented: Number
    }],
    guidelines: [{
        step: String,
        description: String,
        bestPractices: [String]
    }]
}, { timestamps: true });

module.exports = mongoose.model("WasteManagement", WasteManagementSchema);
