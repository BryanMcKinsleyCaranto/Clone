const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is Required'],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is Required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is Required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Comment is Required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);