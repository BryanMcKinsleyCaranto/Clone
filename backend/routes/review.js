const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review');
const auth = require('../auth');

// Middleware for authenticating user's token
const { verify } = auth;

// Add review and rating for a product
router.post('/add/:productId', verify, reviewController.addReview);
router.get('/product/:productId', reviewController.getReviewsForProduct);
module.exports = router;