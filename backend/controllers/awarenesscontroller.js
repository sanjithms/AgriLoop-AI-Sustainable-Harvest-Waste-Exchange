const WasteManagement = require("../models/WasteManagement");

// Get All Waste Management Topics
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await WasteManagement.find();
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Add New Waste Management Topic (For Admin)
exports.addTopic = async (req, res) => {
    const { title, description, methods } = req.body;

    try {
        const topic = await WasteManagement.create({
            title,
            description,
            methods,
            image: req.file ? req.file.path : null
        });

        res.status(201).json(topic);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
