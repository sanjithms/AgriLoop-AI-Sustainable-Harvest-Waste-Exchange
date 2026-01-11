const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['review', 'order', 'payment', 'delivery', 'feedback', 'product'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Product', 'Order', 'Feedback', 'Review']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);