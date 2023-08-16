const express = require('express');
const productController = require('../controllers/product');
const auth = require('../auth');

const {verify, verifyAdmin} = auth;
const router = express.Router();

// Route for creating a new product (restricted to admins only)
router.post('/create', verify, verifyAdmin, productController.createProduct);
router.put('/edit/:productId', verify, verifyAdmin, productController.editProduct);
router.delete('/delete/:productId', verify, verifyAdmin, productController.deleteProduct)
router.get('/list', productController.getProducts);
router.get("/getAllProduct",  productController.getAllProducts);
router.get("/:productId/getSingleProduct", productController.getSingleProduct)
module.exports = router;