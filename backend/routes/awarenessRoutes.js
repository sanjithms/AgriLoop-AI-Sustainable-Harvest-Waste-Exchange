const express = require("express");
const { getAllTopics, addTopic } = require("../controllers/awarenesscontroller");
const { protect } = require("../middlewares/authmiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Regular awareness routes
router.get("/", getAllTopics);
router.post("/", protect, upload.single("image"), addTopic); // Only Admins can add topics

module.exports = router;
