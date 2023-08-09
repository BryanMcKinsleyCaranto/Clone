const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const orderController = require('../controllers/order')
const productController = require('../controllers/product')
const { verify } = require('../auth');

// Add a product to the cart
router.post('/add', verify, cartController.addToCart);

// Remove a product from the cart
router.post('/remove', verify, cartController.removeFromCart);

// Update the quantity of a product in the cart
router.post('/update', verify, cartController.updateCartItem);

// Checkout the cart
router.post('/checkout', verify, cartController.checkoutCart);

module.exports = router;