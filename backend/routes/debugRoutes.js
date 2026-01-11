const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Debug route to check file uploads
router.get('/uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    res.json({
      uploadsDir,
      exists: fs.existsSync(uploadsDir),
      files,
      count: files.length
    });
  } catch (error) {
    res.status(500).json({ uploadsDir, error: error.message });
  }
});

// Debug route to check server status
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

module.exports = router;