const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ["Vegetables", "Fruits", "Grains", "Dairy", "Poultry", "Seeds", "Fertilizer", "Equipment", "Other"]
    },
    price: { type: Number, required: true },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'liters', 'pieces', 'ton', 'grams', 'ml'],
        default: 'kg'
    },
    stock: { type: Number, required: true, default: 1 },
    image: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Farmer-specific fields
    organic: { type: Boolean, default: false },
    harvestDate: { type: Date },
    expiryDate: { type: Date },
    farmLocation: { type: String },
    cultivationMethod: {
        type: String,
        enum: ["Traditional", "Organic", "Hydroponic", "Greenhouse", "Permaculture", ""]
    },

    // Rating and reviews
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    // Sales tracking
    salesCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
