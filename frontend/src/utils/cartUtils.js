/**
 * Utility functions for cart operations
 */
import api from '../api/axios';

/**
 * Updates the cart badge count in the navbar
 * @returns {Promise<void>}
 */
export const updateCartBadge = async () => {
  const cartBadge = document.getElementById('cart-badge');
  if (!cartBadge) return;

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await api.get('/cart');
      const count = response.data.reduce((total, item) => total + item.quantity, 0);
      cartBadge.textContent = count || '0';
    } else {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      cartBadge.textContent = count || '0';
    }
  } catch (err) {
    console.error('Error updating cart badge:', err);
    // Fallback to localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartBadge.textContent = count || '0';
  }
};

/**
 * Synchronizes the local cart with the server cart when user logs in
 * @returns {Promise<void>}
 */
export const syncCartOnLogin = async () => {
  try {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length === 0) return;

    // Add local cart items to server cart
    for (const item of localCart) {
      try {
        await api.post('/cart', {
          productId: item._id,
          quantity: item.quantity,
          isWasteProduct: item.category === 'Waste'
        });
      } catch (err) {
        console.error('Error syncing cart item:', err);
        // Continue with next item even if one fails
      }
    }

    // Clear local cart after syncing
    localStorage.setItem('cart', '[]');
    
    // Update cart badge
    await updateCartBadge();
  } catch (err) {
    console.error('Error syncing cart:', err);
  }
};

/**
 * Adds a product to the cart
 * @param {Object} product - The product to add
 * @param {number} quantity - The quantity to add
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const addToCart = async (product, quantity = 1) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = existingCart.find(item => item._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        existingCart.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || (product.images && product.images[0]),
          category: product.category || 'Waste',
          type: product.type,
          stock: product.stock,
          quantity: quantity,
          isWasteProduct: product.category === 'Waste'
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(existingCart));
    } else {
      await api.post('/cart', {
        productId: product._id,
        quantity: quantity,
        isWasteProduct: product.category === 'Waste'
      });
    }
    
    await updateCartBadge();
    return true;
  } catch (err) {
    console.error('Error adding to cart:', err);
    return false;
  }
};

/**
 * Updates the quantity of an item in the cart
 * @param {string} productId - The ID of the product to update
 * @param {number} quantity - The new quantity
 * @param {boolean} isWasteProduct - Whether the item is a waste product
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const updateCartItemQuantity = async (productId, quantity, isWasteProduct = false) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = cart.find(item => item._id === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    } else {
      await api.put(`/cart/${productId}`, { quantity, isWasteProduct });
    }
    
    await updateCartBadge();
    return true;
  } catch (err) {
    console.error('Error updating cart item:', err);
    return false;
  }
};

/**
 * Removes an item from the cart
 * @param {string} productId - The ID of the product to remove
 * @param {boolean} isWasteProduct - Whether the item is a waste product
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const removeFromCart = async (productId, isWasteProduct = false) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = cart.filter(item => item._id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      await api.delete(`/cart/${productId}`, { data: { isWasteProduct } });
    }
    
    await updateCartBadge();
    return true;
  } catch (err) {
    console.error('Error removing from cart:', err);
    return false;
  }
};