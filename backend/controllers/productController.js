const Product = require("../models/Product");

// Add Product/Waste
exports.addProduct = async (req, res) => {
    console.log('Adding product...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
        name,
        description,
        category,
        price,
        stock,
        organic,
        harvestDate,
        expiryDate,
        farmLocation,
        cultivationMethod
    } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
    }

    try {
        // Use the filename directly (already fixed by the middleware)Use the filename directly (already fixed by the middleware)
        console.log('Image path (fixed):', req.file.path);

        // Create the product
        const product = await Product.create({
            name,
            description,
            category,
            price: Number(price),
            stock: Number(stock),
            image: req.file.path, // This is now just the filename
            seller: req.user.id,
            organic: organic === 'true' || organic === true,
            harvestDate: harvestDate || undefined,
            expiryDate: expiryDate || undefined,
            farmLocation: farmLocation || '',
            cultivationMethod: cultivationMethod || '',
        });

        console.log('Product created:', product);
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.minPrice && req.query.maxPrice) {
            filter.price = { $gte: Number(req.query.minPrice), $lte: Number(req.query.maxPrice) };
        } else if (req.query.minPrice) {
            filter.price = { $gte: Number(req.query.minPrice) };
        } else if (req.query.maxPrice) {
            filter.price = { $lte: Number(req.query.maxPrice) };
        }
        
        // Handle seller filter - need to join with User model to filter by seller name
        if (req.query.seller) {
            try {
                // First find users matching the seller name
                const User = require('../models/User');
                const users = await User.find({ 
                    $or: [
                        { name: { $regex: req.query.seller, $options: 'i' } },
                        { businessName: { $regex: req.query.seller, $options: 'i' } }
                    ]
                });
                
                // Then filter products by these user IDs
                if (users && users.length > 0) {
                    const sellerIds = users.map(user => user._id);
                    filter.seller = { $in: sellerIds };
                } else {
                    // If no matching sellers, return no results
                    filter.seller = null;
                }
            } catch (err) {
                console.error('Error finding sellers:', err);
                // Don't apply the filter if there's an error
            }
        }

        // Build sort object
        let sortOption = {};
        if (req.query.sort) {
            const [field, order] = req.query.sort.split(':');
            sortOption[field] = order === 'desc' ? -1 : 1;
        } else {
            sortOption = { createdAt: -1 }; // Default sort by newest
        }

        const products = await Product.find(filter)
            .populate("seller", "name email role phone businessName location")
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Single Product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("seller", "name email role phone businessName location");

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json(product);
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Check authorization
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Validate and sanitize data
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: parseFloat(req.body.price),
            stock: parseInt(req.body.stock),
            unit: req.body.unit
        };

        // Validate required fields
        if (!updateData.name || !updateData.category || !updateData.price || !updateData.stock || !updateData.unit) {
            return res.status(400).json({ 
                message: "Please fill all required fields",
                requiredFields: ['name', 'category', 'price', 'stock', 'unit']
            });
        }

        // Validate price and stock
        if (isNaN(updateData.price) || updateData.price <= 0) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }
        if (isNaN(updateData.stock) || updateData.stock < 0) {
            return res.status(400).json({ message: "Stock must be a non-negative number" });
        }

        // Update product with validated data
        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Handle image update if provided
        if (req.file) {
            product.image = req.file.path;
            await product.save();
        }

        res.json(product);
    } catch (err) {
        console.error('Error updating product:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Error", 
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Using findByIdAndDelete instead of remove() which is deprecated
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product removed" });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: "Server Error" });
    }
};
