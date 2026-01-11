const { getWasteInfo } = require('../services/openaiService');
const WasteInfo = require('../models/WasteInfo');

/**
 * Get information about a specific agricultural waste type
 */
exports.getWasteInfo = async (req, res) => {
  try {
    const wasteName = req.params.wasteName;
    
    if (!wasteName) {
      return res.status(400).json({
        success: false,
        message: 'Waste name is required'
      });
    }
    
    console.log(`Fetching information for waste type: ${wasteName}`);
    
    const wasteInfo = await WasteInfo.findOne({
      waste_name: { $regex: new RegExp(wasteName, 'i') }
    });

    if (!wasteInfo) {
      return res.status(404).json({
        success: false,
        message: 'Waste information not found',
        suggestedCategories: ['Crop Residue', 'Animal Waste', 'Processing Waste', 'Packaging Waste']
      });
    }
    
    return res.status(200).json({
      success: true,
      data: wasteInfo,
      message: 'Waste information retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error in getWasteInfo controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve waste information',
      error: error.message
    });
  }
};

exports.addWasteInfo = async (req, res) => {
  try {
    const wasteInfo = await WasteInfo.create(req.body);
    return res.status(201).json({
      success: true,
      data: wasteInfo,
      message: 'Waste information added successfully'
    });
  } catch (error) {
    console.error('Error in addWasteInfo controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add waste information',
      error: error.message
    });
  }
};

exports.getAllWasteInfo = async (req, res) => {
  try {
    const { category, sort = 'waste_name' } = req.query;
    const filter = category ? { category } : {};
    
    const wasteInfo = await WasteInfo.find(filter).sort(sort);
    
    // Ensure we always return in a consistent format
    return res.status(200).json({
      success: true,
      count: wasteInfo.length,
      data: wasteInfo,
      message: 'Waste information retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAllWasteInfo controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve waste information',
      error: error.message
    });
  }
};

exports.searchWasteInfo = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const wasteInfo = await WasteInfo.find({
      $or: [
        { waste_name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { 'uses.application': { $regex: query, $options: 'i' } },
        { process: { $regex: query, $options: 'i' } }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: wasteInfo.length,
      data: wasteInfo
    });
  } catch (error) {
    console.error('Error in searchWasteInfo controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search waste information',
      error: error.message
    });
  }
};

exports.updateWasteInfo = async (req, res) => {
  try {
    const wasteInfo = await WasteInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!wasteInfo) {
      return res.status(404).json({
        success: false,
        message: 'Waste information not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: wasteInfo,
      message: 'Waste information updated successfully'
    });
  } catch (error) {
    console.error('Error in updateWasteInfo controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update waste information',
      error: error.message
    });
  }
};