const WasteProduct = require('../models/WasteProduct');
const User = require('../models/User');
const path = require('path');

// Get all waste products with filtering, sorting, and pagination
exports.getWasteProducts = async (req, res) => {
  try {
    const { 
      type, 
      minPrice, 
      maxPrice, 
      location, 
      sort, 
      page = 1, 
      limit = 10,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice && maxPrice) {
      filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
      filter.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    // Add text search if provided
    if (search) {
      // If text index is not working properly, use regex search on multiple fields
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOption = { createdAt: -1 }; // Default sort by newest
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const wasteProducts = await WasteProduct.find(filter)
      .populate('seller', 'name email businessName')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await WasteProduct.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: wasteProducts.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      wasteProducts
    });
  } catch (error) {
    console.error('Error fetching waste products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single waste product by ID
exports.getWasteProductById = async (req, res) => {
  try {
    const wasteProduct = await WasteProduct.findById(req.params.id)
      .populate('seller', 'name email phone businessName address');

    if (!wasteProduct) {
      return res.status(404).json({
        success: false,
        message: 'Waste product not found'
      });
    }

    res.status(200).json({
      success: true,
      wasteProduct
    });
  } catch (error) {
    console.error('Error fetching waste product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new waste product
exports.createWasteProduct = async (req, res) => {
  try {
    console.log('Creating waste product...');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    // Add seller ID from authenticated user
    req.body.seller = req.user.id;

    // Check if user is a farmer or industry
    const user = await User.findById(req.user.id);
    if (user.role !== 'farmer' && user.role !== 'industry') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers and industry users can list waste products'
      });
    }

    // Create a new product data object
    let productData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      quantity: req.body.quantity,
      unit: req.body.unit,
      price: req.body.price,
      location: req.body.location,
      seller: req.user.id
    };

    // Parse JSON strings for nested objects and arrays
    if (req.body.nutrientContent) {
      try {
        productData.nutrientContent = JSON.parse(req.body.nutrientContent);
      } catch (err) {
        console.error('Error parsing nutrientContent:', err);
      }
    }

    if (req.body.pickupDetails) {
      try {
        productData.pickupDetails = JSON.parse(req.body.pickupDetails);
      } catch (err) {
        console.error('Error parsing pickupDetails:', err);
      }
    }

    if (req.body.possibleUses) {
      try {
        productData.possibleUses = JSON.parse(req.body.possibleUses);
      } catch (err) {
        console.error('Error parsing possibleUses:', err);
      }
    }

    if (req.body.certifications) {
      try {
        productData.certifications = JSON.parse(req.body.certifications);
      } catch (err) {
        console.error('Error parsing certifications:', err);
      }
    }

    // Handle file uploads if present
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files...');
      productData.images = req.files.map(file => {
        // Use the filename directly (already fixed by the middleware)
        console.log('File path (fixed):', file.path);
        // The file.path should already be just the filename after upload.fixPaths middleware
        return file.path;
      });
    } else {
      console.log('No files uploaded');
    }

    console.log('Final product data:', productData);
    const wasteProduct = await WasteProduct.create(productData);
    console.log('Waste product created:', wasteProduct);

    res.status(201).json({
      success: true,
      wasteProduct
    });
  } catch (error) {
    console.error('Error creating waste product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update waste product
exports.updateWasteProduct = async (req, res) => {
  try {
    let wasteProduct = await WasteProduct.findById(req.params.id);

    if (!wasteProduct) {
      return res.status(404).json({
        success: false,
        message: 'Waste product not found'
      });
    }

    // Check if user is the seller or an admin
    if (wasteProduct.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this waste product'
      });
    }

    // Create update data object with basic fields
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      quantity: req.body.quantity,
      unit: req.body.unit,
      price: req.body.price,
      location: req.body.location
    };

    // Parse JSON strings for nested objects and arrays
    if (req.body.nutrientContent) {
      try {
        updateData.nutrientContent = JSON.parse(req.body.nutrientContent);
      } catch (err) {
        console.error('Error parsing nutrientContent:', err);
      }
    }

    if (req.body.pickupDetails) {
      try {
        updateData.pickupDetails = JSON.parse(req.body.pickupDetails);
      } catch (err) {
        console.error('Error parsing pickupDetails:', err);
      }
    }

    if (req.body.possibleUses) {
      try {
        updateData.possibleUses = JSON.parse(req.body.possibleUses);
      } catch (err) {
        console.error('Error parsing possibleUses:', err);
      }
    }

    if (req.body.certifications) {
      try {
        updateData.certifications = JSON.parse(req.body.certifications);
      } catch (err) {
        console.error('Error parsing certifications:', err);
      }
    }

    // Handle file uploads if present
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files...');
      // If new images are uploaded, replace old ones
      updateData.images = req.files.map(file => file.path);
    }

    // Update the waste product with the new data
    wasteProduct = await WasteProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      wasteProduct
    });
  } catch (error) {
    console.error('Error updating waste product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete waste product
exports.deleteWasteProduct = async (req, res) => {
  try {
    const wasteProduct = await WasteProduct.findById(req.params.id);

    if (!wasteProduct) {
      return res.status(404).json({
        success: false,
        message: 'Waste product not found'
      });
    }

    // Check if user is the seller or an admin
    if (wasteProduct.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this waste product'
      });
    }

    await WasteProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Waste product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting waste product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get waste products by seller
exports.getSellerWasteProducts = async (req, res) => {
  try {
    const wasteProducts = await WasteProduct.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: wasteProducts.length,
      wasteProducts
    });
  } catch (error) {
    console.error('Error fetching seller waste products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get waste product statistics
exports.getWasteProductStats = async (req, res) => {
  try {
    // Total count
    const totalCount = await WasteProduct.countDocuments();
    
    // Count by type
    const countByType = await WasteProduct.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);
    
    // Price range
    const priceStats = await WasteProduct.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      totalCount,
      countByType,
      priceStats: priceStats[0] || {}
    });
  } catch (error) {
    console.error('Error fetching waste product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};