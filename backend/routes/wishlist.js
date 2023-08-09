const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');
const auth = require('../auth');

// Middleware for authenticating user's token
const { verify } = auth;

// Add product to wishlist
router.post('/add/:productId', verify, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', verify, wishlistController.removeFromWishlist);

// route to view wishlist
router.get('/view', verify, wishlistController.viewWishlist);


module.exports = router;