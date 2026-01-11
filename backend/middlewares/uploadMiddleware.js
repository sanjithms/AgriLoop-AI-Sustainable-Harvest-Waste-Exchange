const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
} else {
  console.log('Uploads directory exists at:', uploadsDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename);

    // Store the filename in the request object for later use
    if (!req.uploadedFiles) {
      req.uploadedFiles = [];
    }
    req.uploadedFiles.push(filename);

    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Add a middleware to fix file paths after upload
upload.fixPaths = (req, res, next) => {
  // For single file uploads
  if (req.file) {
    // Replace the full path with just the filename
    const filename = path.basename(req.file.path);
    req.file.originalPath = req.file.path; // Save original path for debugging
    req.file.path = filename; // Just use the filename without the uploads/ prefix
    req.file.filename = filename; // Ensure filename is set correctly
    console.log('Fixed single file path:', req.file.path);
  }

  // For multiple file uploads
  if (req.files) {
    req.files.forEach(file => {
      const filename = path.basename(file.path);
      file.originalPath = file.path; // Save original path for debugging
      file.path = filename; // Just use the filename without the uploads/ prefix
      file.filename = filename; // Ensure filename is set correctly
    });
    console.log('Fixed multiple file paths');
  }

  next();
};

module.exports = upload;
