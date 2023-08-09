const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is Required'],
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: {
              type: String, // Add a field for product name
            },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  reviews: [
     {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Review',
     },
   ],
  totalAmount: {
    type: Number,
    required: [true, 'Total Amount is Required'],
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping Address is Required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment Method is Required'],
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);