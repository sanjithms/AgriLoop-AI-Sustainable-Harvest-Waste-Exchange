const fs = require('fs');
const path = require('path');

/**
 * Ensures that the uploads directory exists
 */
const ensureUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Created uploads directory at:", uploadsDir);
  } else {
    console.log("Uploads directory exists at:", uploadsDir);
  }
};

module.exports = {
  ensureUploadsDirectory
};