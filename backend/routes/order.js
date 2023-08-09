const express = require('express');
const orderController = require('../controllers/order');
const auth = require('../auth');

const router = express.Router();

const {verify, verifyAdmin} = auth

// Route for creating an order
router.post('/create', verify, orderController.createOrder);
// Route for user's order history
router.get('/history', verify, orderController.getUserOrderHistory);

module.exports = router;