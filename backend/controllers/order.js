const Order = require('../models/order');
const User = require("../models/User");

const Product = require('../models/product');

const {createAccessToken } = require('../auth');

// Controller function to get user's order history
module.exports.getUserOrderHistory = async (req, res) => {
  try {
    // Fetch orders for the authenticated user
    const orders = await Order.find({ user: req.user.id });

    // Map the orders to return only necessary information (status, orderDate, totalAmount)
    const orderHistory = orders.map((order) => ({
      status: order.status,
      orderDate: order.createdAt,
      totalAmount: order.totalAmount,
    }));

    return res.status(200).json(orderHistory);
  } catch (error) {
    // Handle any errors that occur during fetching order history
    console.error('Error while fetching user order history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller function to create a new order
exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;
    const orderDate = new Date();

    // Calculate the totalAmount and construct the products array with the required fields
    let totalAmount = 0;
    const orderedProducts = [];

    for (const productData of products) {
      const productId = productData.productId;
      const quantityOrdered = productData.quantity;

      // Find the product in the database
      const foundProduct = await Product.findById(productId);

      // Check if the product exists and has enough quantity available
      if (!foundProduct || foundProduct.quantity < quantityOrdered) {
        return res.status(400).json({ error: 'Insufficient quantity for the product: ' + productId });
      }

      // Calculate the subtotal for the product (price * quantity)
      const subtotal = foundProduct.price * quantityOrdered;

      // Add the subtotal to the totalAmount
      totalAmount += subtotal;

      // Construct the product object to be added to the orderedProducts array
      const orderedProduct = {
        product: productId,
        quantity: quantityOrdered,
        price: foundProduct.price,
      };

      orderedProducts.push(orderedProduct);

      // Reduce the product quantity in the database
      foundProduct.quantity -= quantityOrdered;

      // Save the updated product quantity
      await foundProduct.save();
    }

    // Create a new order document with the calculated totalAmount and orderedProducts
    const newOrder = new Order({
      user: userId,
      products: orderedProducts,
      totalAmount,
      shippingAddress,
      paymentMethod,
      orderDate,
    });

    // Save the new order to the database
    await newOrder.save();

    return res.status(201).json({ message: 'Order created successfully', orderId: newOrder._id });
  } catch (error) {
    // Handle any errors that occur during order creation
    console.error('Error while creating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};