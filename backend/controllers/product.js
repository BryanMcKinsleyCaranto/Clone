const Product = require('../models/product');
const User = require("../models/User");
const {createAccessToken } = require('../auth');

// Controller function to create a new product
module.exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    // Create a new product document
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      category

    });

    // Save the new product to the database
    await newProduct.save();

    return res.status(201).json({ message: 'Product created successfully', productId: newProduct._id });
  } catch (error) {
    // Handle any errors that occur during product creation
    console.error('Error while creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




