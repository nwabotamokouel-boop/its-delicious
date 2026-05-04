const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  notes: String,
  items: [orderItemSchema],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  userId: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
