const Cart = require('../models/Cart');
const Product = require('../models/Product');
const WasteProduct = require('../models/WasteProduct');

// Get user's cart with proper validation
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product')
      .populate('wasteItems.product');

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [], wasteItems: [] });
      await cart.save();
      return res.json([]);
    }

    // Clean up invalid items and validate quantities
    let needsUpdate = false;
    cart.items = cart.items.filter(item => {
      if (!item.product) {
        needsUpdate = true;
        return false;
      }
      if (item.quantity > item.product.stock) {
        item.quantity = item.product.stock;
        needsUpdate = true;
      }
      return true;
    });

    cart.wasteItems = cart.wasteItems.filter(item => {
      if (!item.product) {
        needsUpdate = true;
        return false;
      }
      if (item.quantity > item.product.quantity) {
        item.quantity = item.product.quantity;
        needsUpdate = true;
      }
      return true;
    });

    if (needsUpdate) {
      await cart.save();
    }

    // Format response for regular products
    const productItems = cart.items.map(item => {
      const product = item.product;
      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        unit: product.unit,
        quantity: item.quantity,
        isWasteProduct: false
      };
    });

    // Format response for waste products with proper units
    const wasteItems = cart.wasteItems.map(item => {
      const product = item.product;
      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        category: 'Waste',
        type: product.type,
        unit: product.unit || 'kg',
        quantity: item.quantity,
        availableQuantity: product.quantity,
        isWasteProduct: true
      };
    });

    res.json([...productItems, ...wasteItems]);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart with improved validation
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, isWasteProduct = false } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [], wasteItems: [] });
    }

    if (isWasteProduct) {
      const wasteProduct = await WasteProduct.findById(productId);
      if (!wasteProduct) {
        return res.status(404).json({ message: 'Waste product not found' });
      }

      // Check available quantity
      const existingItem = cart.wasteItems.find(item => 
        item.product.toString() === productId
      );

      const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
      if (wasteProduct.quantity < totalQuantity) {
        return res.status(400).json({ 
          message: `Only ${wasteProduct.quantity} ${wasteProduct.unit || 'units'} available`,
          availableQuantity: wasteProduct.quantity
        });
      }

      if (existingItem) {
        existingItem.quantity = totalQuantity;
      } else {
        cart.wasteItems.push({ product: productId, quantity });
      }
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );

      const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
      if (product.stock < totalQuantity) {
        return res.status(400).json({ 
          message: `Only ${product.stock} ${product.unit || 'units'} available in stock`,
          availableQuantity: product.stock
        });
      }

      if (existingItem) {
        existingItem.quantity = totalQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('items.product');
    await cart.populate('wasteItems.product');

    return await this.getCart(req, res);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity with validation
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, isWasteProduct = false } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (isWasteProduct) {
      const itemIndex = cart.wasteItems.findIndex(item =>
        item.product.toString() === productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      const wasteProduct = await WasteProduct.findById(productId);
      if (!wasteProduct) {
        return res.status(404).json({ message: 'Waste product not found' });
      }

      if (wasteProduct.quantity < quantity) {
        return res.status(400).json({ 
          message: `Only ${wasteProduct.quantity} ${wasteProduct.unit || 'units'} available`,
          availableQuantity: wasteProduct.quantity
        });
      }

      cart.wasteItems[itemIndex].quantity = quantity;
    } else {
      const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ 
          message: `Only ${product.stock} ${product.unit || 'units'} available in stock`,
          availableQuantity: product.stock
        });
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return await this.getCart(req, res);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isWasteProduct = false } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (isWasteProduct) {
      cart.wasteItems = cart.wasteItems.filter(item =>
        item.product.toString() !== productId
      );
    } else {
      cart.items = cart.items.filter(item =>
        item.product.toString() !== productId
      );
    }

    await cart.save();
    return await this.getCart(req, res);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.wasteItems = [];
    await cart.save();

    res.json([]);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};