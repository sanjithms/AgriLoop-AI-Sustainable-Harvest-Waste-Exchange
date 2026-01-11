const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  products: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product",
        required: true 
      },
      name: { 
        type: String, 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: { 
        type: Number, 
        required: true,
        min: [0, 'Price cannot be negative']
      },
      image: { 
        type: String 
      },
      category: {
        type: String,
        required: true
      },
      isWasteProduct: {
        type: Boolean,
        default: false
      },
      type: String // For waste products
    }
  ],
  shippingAddress: {
    name: { 
      type: String, 
      required: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    postalCode: { 
      type: String, 
      required: true 
    },
    country: { 
      type: String, 
      default: "India" 
    },
    phone: {
      type: String
    }
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    default: "card",
    enum: ["card", "upi", "netbanking", "wallet", "cod"]
  },
  paymentDetails: {
    paymentIntentId: { 
      type: String,
      // Not required anymore as UPI payments won't have this
    },
    upiId: {
      type: String,
      // For UPI payments
    },
    upiReference: {
      type: String,
      // For UPI transaction reference
    },
    codCharges: { 
      type: Number,
      default: 0
    },
    status: { 
      type: String, 
      default: "Completed",
      enum: ["Pending", "Completed", "Failed", "Refunded"]
    },
    amountPaid: { 
      type: Number,
      min: 0
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  taxAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  shippingAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  couponCode: {
    type: String
  },
  orderNumber: {
    type: String,
    required: true
    // Removed unique: true as we're defining it in the index below
  },  status: {
    type: String,
    required: true,
    default: "Processing",
    enum: ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"]
  },
  deliveredAt: { 
    type: Date 
  },
  cancelledAt: { 
    type: Date 
  },
  cancellationReason: { 
    type: String 
  },
  estimatedDelivery: { 
    type: Date,
    required: true
  },
  notes: { 
    type: String 
  },
  trackingNumber: {
    type: String
  },
  carrier: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  statusHistory: [
    {
      status: {
        type: String,
        required: true,
        enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"]
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      notes: {
        type: String
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: {
    type: String
  }
}, { 
  timestamps: true 
});

// Validate products array is not empty
orderSchema.pre('save', function(next) {
  if (this.products.length === 0) {
    next(new Error('Order must contain at least one product'));
  }
  next();
});

// Custom method to validate stock availability
orderSchema.methods.validateStock = async function() {
  const Product = mongoose.model('Product');
  const WasteProduct = mongoose.model('WasteProduct');
  
  for (const item of this.products) {
    if (item.isWasteProduct) {
      const wasteProduct = await WasteProduct.findById(item.product);
      if (!wasteProduct) {
        throw new Error(`Waste product ${item.name} not found`);
      }
      if (wasteProduct.quantity < item.quantity) {
        throw new Error(`Only ${wasteProduct.quantity} ${wasteProduct.unit || 'units'} available for ${item.name}`);
      }
    } else {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Only ${product.stock} ${product.unit || 'units'} available for ${item.name}`);
      }
    }
  }
  return true;
};

// Add index for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });

// Pre-save hook to update status history
orderSchema.pre('save', function(next) {
  // If the status has changed or this is a new document
  if (this.isNew || this.isModified('status')) {
    // Add the current status to the history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: this.notes
    });
    
    // Set appropriate timestamps based on status
    if (this.status === 'Delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    } else if (this.status === 'Cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

// Virtual for total items count
orderSchema.virtual('itemCount').get(function() {
  return this.products.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate subtotal
orderSchema.methods.getSubtotal = function() {
  return this.totalAmount - this.taxAmount - this.shippingAmount;
};

// Static method to find orders by date range
orderSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model("Order", orderSchema);
