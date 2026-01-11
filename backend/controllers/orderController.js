const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const WasteProduct = require('../models/WasteProduct');
const Cart = require('../models/Cart');
const { generateOrderNumber } = require('../utils/helpers');
const { createNotification } = require('./notification');
const { sendEmail } = require('../utils/emailService');

// Get cleaned up products array with validated data
const validateAndCleanProducts = async (products) => {
  const cleanedProducts = [];
  const errors = [];

  for (const item of products) {
    try {
      if (item.isWasteProduct) {
        const wasteProduct = await WasteProduct.findById(item.product)
          .populate('seller', 'name email phone businessName');

        if (!wasteProduct) {
          throw new Error(`Waste product ${item.name} not found`);
        }

        if (wasteProduct.quantity < item.quantity) {
          throw new Error(`Only ${wasteProduct.quantity} ${wasteProduct.unit || 'units'} available for ${item.name}`);
        }

        cleanedProducts.push({
          product: wasteProduct._id,
          name: wasteProduct.name,
          quantity: item.quantity,
          price: wasteProduct.price,
          image: wasteProduct.images && wasteProduct.images.length > 0 ? wasteProduct.images[0] : null,
          category: 'Waste',
          type: wasteProduct.type,
          unit: wasteProduct.unit || 'kg',
          isWasteProduct: true,
          seller: wasteProduct.seller
        });
      } else {
        const product = await Product.findById(item.product)
          .populate('seller', 'name email phone businessName');

        if (!product) {
          throw new Error(`Product ${item.name} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Only ${product.stock} ${product.unit || 'units'} available for ${item.name}`);
        }

        cleanedProducts.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          image: product.image,
          category: product.category,
          unit: product.unit || 'units',
          isWasteProduct: false,
          seller: product.seller
        });
      }
    } catch (err) {
      errors.push(err.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return cleanedProducts;
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      paymentDetails = {},
      couponCode,
      isGift = false,
      giftMessage = ''
    } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product')
      .populate('wasteItems.product');

    if (!cart || (cart.items.length === 0 && cart.wasteItems.length === 0)) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Combine regular and waste products
    const cartProducts = [
      ...cart.items.map(item => ({
        ...item.toObject(),
        isWasteProduct: false
      })),
      ...cart.wasteItems.map(item => ({
        ...item.toObject(),
        isWasteProduct: true
      }))
    ];

    // Validate and clean products
    const cleanedProducts = await validateAndCleanProducts(cartProducts);

    // Calculate totals
    const subtotal = cleanedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = process.env.TAX_RATE || 0.1; // 10% tax by default
    const taxAmount = subtotal * taxRate;
    const shippingAmount = cleanedProducts.length * (process.env.SHIPPING_RATE || 100); // ₹100 per item
    const discountAmount = 0; // Implement coupon logic here if needed

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    const invoiceNumber = `INV-${orderNumber}`;

    // Create the order
    const newOrder = await Order.create({
      orderNumber,
      invoiceNumber,
      buyer: req.user.id,
      products: cleanedProducts,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      totalAmount,
      taxAmount,
      shippingAmount,
      discountAmount,
      couponCode,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isGift,
      giftMessage,
      statusHistory: [{
        status: 'Processing',
        timestamp: new Date(),
        notes: 'Order placed successfully',
        updatedBy: req.user.id
      }]
    });

    // Update product quantities and sales count
    for (const item of cleanedProducts) {
      if (item.isWasteProduct) {
        const wasteProduct = await WasteProduct.findById(item.product);
        if (wasteProduct) {
          wasteProduct.quantity -= item.quantity;
          if (typeof wasteProduct.salesCount !== 'undefined') {
            wasteProduct.salesCount += item.quantity;
          }
          await wasteProduct.save();
        }
      } else {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          if (typeof product.salesCount !== 'undefined') {
            product.salesCount += item.quantity;
          }
          await product.save();
        }
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [], wasteItems: [] } }
    );

    // Create notifications
    const notificationPromises = [];

    // Notification for buyer
    notificationPromises.push(
      createNotification({
        recipient: req.user.id,
        type: 'order',
        title: 'Order Confirmation',
        message: `Your order #${orderNumber} has been placed successfully`,
        relatedId: newOrder._id,
        onModel: 'Order',
        actionUrl: `/order/${newOrder._id}`
      })
    );

    // Notifications for sellers
    const sellerIds = new Set(cleanedProducts.map(item => item.seller._id.toString()));

    for (const sellerId of sellerIds) {
      const sellerProducts = cleanedProducts.filter(item => 
        item.seller._id.toString() === sellerId
      );

      const isWasteOrder = sellerProducts.some(item => item.isWasteProduct);
      
      notificationPromises.push(
        createNotification({
          recipient: sellerId,
          type: 'order',
          title: `New ${isWasteOrder ? 'Waste Product' : 'Product'} Order`,
          message: `You have received a new order #${orderNumber}`,
          relatedId: newOrder._id,
          onModel: 'Order',
          actionUrl: `/order/${newOrder._id}`
        })
      );
    }

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All User Orders
exports.getUserOrders = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build filter object
    const filter = { buyer: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    // Get orders with pagination and sorting
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      orders,
      page,
      pages: Math.ceil(totalOrders / limit),
      total: totalOrders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Order By ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Calculate additional information
    const subtotal = order.totalAmount - order.taxAmount - order.shippingAmount;
    const itemCount = order.products.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      order,
      subtotal,
      itemCount
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}`
      });
    }

    // Update order status
    order.status = 'Cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = reason || 'No reason provided';

    // Add to status history
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      notes: reason || 'No reason provided',
      updatedBy: req.user.id
    });

    // Restore product stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;

        // Update product sales count if it exists
        if (typeof product.salesCount !== 'undefined' && product.salesCount >= item.quantity) {
          product.salesCount -= item.quantity;
        }

        await product.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter options
    const filterOptions = {};

    // Status filter
    if (req.query.status) {
      filterOptions.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filterOptions.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Customer filter
    if (req.query.customer) {
      const customerFilter = req.query.customer;
      const customers = await User.find({
        $or: [
          { name: { $regex: customerFilter, $options: 'i' } },
          { email: { $regex: customerFilter, $options: 'i' } }
        ]
      }).select('_id');

      if (customers.length > 0) {
        filterOptions.buyer = { $in: customers.map(c => c._id) };
      }
    }

    // Order number filter
    if (req.query.orderNumber) {
      filterOptions.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };
    }

    // Total amount range filter
    if (req.query.minAmount && req.query.maxAmount) {
      filterOptions.totalAmount = {
        $gte: parseFloat(req.query.minAmount),
        $lte: parseFloat(req.query.maxAmount)
      };
    } else if (req.query.minAmount) {
      filterOptions.totalAmount = { $gte: parseFloat(req.query.minAmount) };
    } else if (req.query.maxAmount) {
      filterOptions.totalAmount = { $lte: parseFloat(req.query.maxAmount) };
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filterOptions);

    // Get orders with pagination, sorting, and population
    const orders = await Order.find(filterOptions)
      .populate('buyer', 'name email phone')
      .populate('statusHistory.updatedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate additional statistics
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalAmount / (orders.length || 1);

    res.json({
      success: true,
      orders,
      page,
      pages: Math.ceil(totalOrders / limit),
      total: totalOrders,
      stats: {
        totalAmount,
        averageOrderValue,
        ordersPerPage: orders.length,
        totalOrders
      }
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = status;

    // Add notes if provided
    if (notes) {
      order.notes = notes;
    }

    // Add to status history
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      notes: notes,
      updatedBy: req.user.id
    });

    // If status is delivered, set deliveredAt date
    if (status === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = Date.now();
    }

    // If status is cancelled, set cancelledAt date
    if (status === 'Cancelled' && !order.cancelledAt) {
      order.cancelledAt = Date.now();
    }

    // If tracking info is provided
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.carrier) {
      order.carrier = req.body.carrier;
    }

    await order.save();

    // Get buyer information
    const buyer = await User.findById(order.buyer);

    // Create notification for buyer
    await createNotification({
      recipient: order.buyer,
      type: 'order',
      title: 'Order Status Update',
      message: `Your order #${order.orderNumber} status has been updated to ${status}`,
      relatedId: order._id,
      onModel: 'Order',
      actionUrl: `/order/${order._id}`
    });

    // Send email notification based on status
    if (buyer && buyer.email) {
      try {
        if (status === 'Shipped') {
          await sendEmail(
            buyer.email,
            'deliveryUpdate',
            [order, buyer, 'Shipped']
          );
        } else if (status === 'Delivered') {
          await sendEmail(
            buyer.email,
            'deliveryUpdate',
            [order, buyer, 'Delivered']
          );
        } else if (status === 'Cancelled') {
          await sendEmail(
            buyer.email,
            'deliveryUpdate',
            [order, buyer, 'Cancelled']
          );
        }
        console.log(`Order ${status} email sent`);
      } catch (emailError) {
        console.error(`Error sending order ${status} email:`, emailError);
        // Continue even if email fails
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Order Statistics
exports.getOrderStats = async (req, res) => {
  try {
    // Get date range from query params or use default (last 30 days)
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

    // Basic stats
    const totalOrders = await Order.countDocuments();
    const totalOrdersInRange = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Orders by date (daily)
    const ordersByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Orders by month
    const ordersByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } // Last year
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Revenue stats
    const revenueStats = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          taxCollected: { $sum: '$taxAmount' },
          shippingCollected: { $sum: '$shippingAmount' }
        }
      }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: '$products.product',
          productName: { $first: '$products.name' },
          totalQuantity: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      dateRange: {
        startDate,
        endDate
      },
      overview: {
        totalOrders,
        totalOrdersInRange,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        averageOrderValue: revenueStats[0]?.averageOrderValue || 0
      },
      ordersByStatus,
      ordersByDate,
      ordersByMonth,
      revenueStats: revenueStats[0] || {},
      topProducts
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
