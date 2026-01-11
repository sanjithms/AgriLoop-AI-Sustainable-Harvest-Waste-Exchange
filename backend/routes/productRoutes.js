const express = require("express");
const { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect } = require("../middlewares/authmiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/", protect, upload.single("productImage"), addProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, upload.single("productImage"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
