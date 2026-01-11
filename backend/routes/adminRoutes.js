const express = require("express");
const { getSalesData } = require("../controllers/adminController");
const { protect, admin } = require("../middlewares/authmiddleware");

const router = express.Router();

router.get("/sales-data", protect, admin, getSalesData);

module.exports = router;
