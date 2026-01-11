// This controller has been deprecated in favor of wasteInfoController.js

exports.getAIResponse = async (req, res) => {
    return res.status(301).json({
        message: "This API endpoint has been deprecated. Please use /api/waste-info/:wasteName instead."
    });
};const WasteManagement = require("../models/WasteManagement");
// We'll use a simpler approach without requiring OpenAI
console.log("Using local response generation for AI assistant");

// AI-powered waste management awareness
exports.getAIResponse = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: "Query is required" });
    }

    try {
        // First, check if we have information in our database
        const wasteInfo = await WasteManagement.findOne({
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { description: { $regex: new RegExp(query, "i") } },
                { methods: { $elemMatch: { $regex: new RegExp(query, "i") } } }
            ]
        });

        if (wasteInfo) {
            // Return database response
            return res.json({
                fromDatabase: true,
                response: `**${wasteInfo.title}**  
- **Description:** ${wasteInfo.description}  
- **Methods:** ${wasteInfo.methods.join(', ')}  
${wasteInfo.image ? `- **Image:** ${wasteInfo.image}` : ''}`
            });
        }

        // Use predefined responses based on keywords in the query
        const lowerQuery = query.toLowerCase();
        let response;

        // Check for specific waste types
        if (lowerQuery.includes('rice straw') || lowerQuery.includes('rice husk')) {
            response = "Rice straw and husks can be used for animal bedding, mushroom cultivation, biofuel production, and as raw material for paper making. They can be composted or used in biochar production. Market value ranges from ₹1,000-3,000 per ton depending on quality and processing.";
        }
        else if (lowerQuery.includes('coconut') || lowerQuery.includes('coir')) {
            response = "Coconut waste (shells, husks, coir) can be processed into fiber products, growing medium, activated carbon, and decorative items. Coconut shells can also be used for crafts and as biomass fuel. Market value ranges from ₹5,000-15,000 per ton for processed coir products.";
        }
        else if (lowerQuery.includes('sugarcane') || lowerQuery.includes('bagasse')) {
            response = "Sugarcane bagasse can be used for paper production, as a biofuel, in mushroom cultivation, and as animal feed when treated properly. It's also used in manufacturing of biodegradable plates and containers. Market value ranges from ₹2,000-8,000 per ton depending on quality.";
        }
        else if (lowerQuery.includes('compost') || lowerQuery.includes('composting')) {
            response = "Composting agricultural waste creates valuable soil amendments that improve soil structure, water retention, and fertility. The process involves creating a mix of 'green' (nitrogen-rich) and 'brown' (carbon-rich) materials in a 1:3 ratio, keeping it moist but not wet, and turning regularly. Finished compost can sell for ₹5,000-12,000 per ton.";
        }
        else if (lowerQuery.includes('biogas') || lowerQuery.includes('methane')) {
            response = "Biogas production from agricultural waste provides renewable energy while reducing methane emissions. The process involves anaerobic digestion in specially designed digesters. A medium-sized biogas plant can generate 8-10 cubic meters of biogas daily from farm waste, equivalent to 4-5 LPG cylinders per month.";
        }
        else if (lowerQuery.includes('market') || lowerQuery.includes('price') || lowerQuery.includes('value')) {
            response = "Agricultural waste prices vary widely based on type, processing level, and local demand. Raw materials typically fetch ₹1,000-5,000 per ton, while processed materials can reach ₹10,000-80,000 per ton. Value-added products like crafts, furniture, or specialized compost command premium prices.";
        }
        else {
            // Default response for other queries
            response = `I don't have specific information about "${query}" yet. Agricultural waste management typically involves collection, sorting, processing, and conversion into valuable products or energy. Common approaches include composting, biogas production, creating value-added products, and using waste as biomass fuel. Would you like to know about specific waste types like rice straw, coconut shells, or sugarcane bagasse?`;
        }

        res.json({
            fromDatabase: false,
            response: response
        });
    } catch (error) {
        console.error("AI API Error:", error);
        res.status(500).json({ 
            message: "Error processing request", 
            error: error.message 
        });
    }
};