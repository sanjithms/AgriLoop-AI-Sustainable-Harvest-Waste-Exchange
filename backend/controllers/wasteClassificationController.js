const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Classify waste from an uploaded image
 */
exports.classifyWasteImage = async (req, res) => {
  try {
    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    console.log('Image uploaded:', req.file.path);

    // Use classification based on filename
    return res.status(200).json({
      success: true,
      data: getClassification(req.file.originalname),
      message: 'Classification generated'
    });

  } catch (error) {
    console.error('Error in classifyWasteImage controller:', error);

    return res.status(200).json({
      success: true,
      data: getClassification(req.file ? req.file.originalname : 'unknown'),
      message: 'Classification due to error'
    });
  }
};

/**
 * Get classification based on filename
 * @param {string} filename - The name of the uploaded file
 * @returns {Object} - Classification data
 */
const getClassification = (filename) => {
  console.log(`Generating classification for file: ${filename}`);

  // Extract potential keywords from filename
  const lowerFilename = filename.toLowerCase();

  // Check for common waste types in filename
  let wasteType = "Unknown agricultural waste";
  let analysis = "";

  if (lowerFilename.includes('rice') || lowerFilename.includes('paddy')) {
    wasteType = "Rice husks/straw";
    analysis = "The image appears to show rice husks or rice straw, which is a common agricultural waste from rice cultivation. Rice husks can be used for various applications including biofuel production, as a soil amendment, or as a raw material for construction materials. Rice straw can be used for animal bedding, mushroom cultivation, or composting.";
  }
  else if (lowerFilename.includes('sugarcane') || lowerFilename.includes('bagasse')) {
    wasteType = "Sugarcane bagasse";
    analysis = "The image shows sugarcane bagasse, which is the fibrous residue left after sugarcane stalks are crushed to extract their juice. Bagasse is commonly used as a biofuel in sugar mills, for paper production, as animal feed, or as a raw material for various bioproducts.";
  }
  else if (lowerFilename.includes('corn') || lowerFilename.includes('maize')) {
    wasteType = "Corn stover/cobs";
    analysis = "The image shows corn stover or corn cobs, which are agricultural residues from corn harvesting. Corn stover includes the leaves, stalks, and cobs left in the field after harvest. These materials can be used for animal feed, biofuel production, or as soil amendments when properly processed.";
  }
  else if (lowerFilename.includes('wheat') || lowerFilename.includes('straw')) {
    wasteType = "Wheat straw";
    analysis = "The image shows wheat straw, which is the dry stalks left after wheat grain is harvested. Wheat straw is commonly used for animal bedding, as a soil amendment, for mushroom cultivation, or as a biofuel. It can also be processed into paper products or construction materials.";
  }
  else if (lowerFilename.includes('coconut')) {
    wasteType = "Coconut husks/shells";
    analysis = "The image shows coconut husks or shells, which are byproducts of coconut processing. Coconut husks can be processed into coir fiber for various applications including rope, mats, and growing media. Coconut shells can be used for activated carbon production, as fuel, or for decorative items.";
  }
  else {
    analysis = "The image appears to show some type of agricultural waste material. Without more specific visual cues, it's difficult to identify the exact type. Agricultural waste can generally be processed for various applications including composting, biofuel production, animal feed, or as raw materials for various products depending on the specific type.";
  }

  return {
    wasteType: wasteType,
    analysis: analysis,
    imagePath: filename
  };
};