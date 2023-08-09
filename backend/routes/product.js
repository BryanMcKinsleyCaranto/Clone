const express = require('express');
const productController = require('../controllers/product');
const auth = require('../auth');

const {verify, verifyAdmin} = auth;
const router = express.Router();

// Route for creating a new product (restricted to admins only)
router.post('/create', verify, verifyAdmin, productController.createProduct);

module.exports = router;