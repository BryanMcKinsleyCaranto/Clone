const Cart = require('../models/Cart');
const User = require('../models/User');
const Order = require('../models/order');
const Product = require('../models/product');
const { createAccessToken } = require('../auth');



exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Assuming the decoded user ID is available in req.user

    // Find the user's cart or create a new cart if not exists
    let cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    // Check if the product is already in the cart
    const existingProduct = cart.products.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingProduct) {
      // If the product is already in the cart, update the quantity
      existingProduct.quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      cart.products.push({ product: product._id, quantity, name: product.name });
      // Note: The "name" field will now be added to the cart.products array.

    }

    await cart.save();
    return res.status(200).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; // Assuming the decoded user ID is available in req.user

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the index of the product with the matching productId in the cart
    const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

    if (productIndex === -1) {
      // Product not found in cart
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    await cart.save();
    return res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Assuming the decoded user ID is available in req.user

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the index of the product with the matching productId in the cart
    const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

    if (productIndex === -1) {
      // Product not found in cart
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Update the quantity of the product in the cart
    cart.products[productIndex].quantity = quantity;

    await cart.save();
    return res.status(200).json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkoutCart = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id; // Assuming the decoded user ID is available in req.user

    // Find the user's cart and populate the products with product details
    const cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Calculate total amount for the order
    let totalAmount = 0;
    cart.products.forEach((cartItem) => {
      totalAmount += cartItem.product.price * cartItem.quantity;
    });

    // Create the order
    const order = new Order({
      user: userId,
      products: cart.products.map((item) => ({
        product: item.product._id,
        name: item.product.name, // Include the product name
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    // Reduce the product quantity in the database
    for (const cartItem of cart.products) {
      const productId = cartItem.product._id;
      const quantityOrdered = cartItem.quantity;

      // Find the product in the database
      const foundProduct = await Product.findById(productId);

      // Check if the product exists and has enough quantity available
      if (!foundProduct || foundProduct.quantity < quantityOrdered) {
      	const productName = cartItem.product.name;

        return res.status(400).json({ error: 'Insufficient quantity for the product: ' + productName });
      }

      // Reduce the product quantity
      foundProduct.quantity -= quantityOrdered;

      // Save the updated product quantity
      await foundProduct.save();
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the order to the user's order history (assuming there is an orderHistory array in the User model)
    // You can modify this based on how you handle user order history
    if (!user.orderHistory) {
      user.orderHistory = [];
    }
    user.orderHistory.push(order._id);
    await user.save();

    // Clear the cart after successful checkout
    await Cart.findOneAndUpdate({ user: userId }, { products: [] });

    // Return the response with the order details and the product name
    return res.status(200).json({ message: 'Checkout successful', order });
  } catch (error) {
    console.error('Error during checkout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};