const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category Name is Required'],
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model('Category', categorySchema);