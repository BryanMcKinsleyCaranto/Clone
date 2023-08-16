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


module.exports.editProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const { userId } = req.user; // Use userId instead of Id
    const { productId } = req.params; 
    // Find the product by productId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product details
    product.name = name;
    product.description = description;
    product.price = price;
    product.quantity = quantity;
    product.category = category;

    await product.save();

    return res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error while editing product', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Delete the product by productId
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error while deleting product', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.getProducts = async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find();

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error while fetching products', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.getAllProducts = (req,res) => {
    return Product.find({}).then(result=>{
     
      return res.send(result)
    })
    .catch(err => res.send(err))

}
module.exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product by its ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Return the product details
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error while fetching single product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

