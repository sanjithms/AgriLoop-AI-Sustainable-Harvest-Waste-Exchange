// Generate a unique order number
exports.generateOrderNumber = () => {
  const prefix = 'SAG'; // Smart AGri
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Random 4-digit number
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate estimated delivery date (default: 7 days from order date)
exports.calculateEstimatedDelivery = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Format currency
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Calculate order summary
exports.calculateOrderSummary = (items, shippingFee = 0, taxRate = 0.18) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount + shippingFee;
  
  return {
    subtotal,
    taxAmount,
    shippingFee,
    total
  };
};

// Generate pagination data
exports.generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};