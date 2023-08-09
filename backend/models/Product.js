const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product Name is Required'],
  },
  description: {
    type: String,
    required: [true, 'Product Description is Required'],
  },
  price: {
    type: Number,
    required: [true, 'Product Price is Required'],
  },
  quantity: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Product Category is Required'],
  },
  tags: {
    type: [String],
  },
  imageUrl: {
    type: String,
  },
});

module.exports = mongoose.model('Product', productSchema);