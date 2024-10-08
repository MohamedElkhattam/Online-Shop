const express = require('express');
const router = express.Router();
const productsController = require('../controllers/shop')

router.get('/',productsController.getShop);
router.get('/products' , productsController.getProducts);
router.get('/products/:productId' , productsController.getProductDetails);
router.get('/cart' , productsController.getCart);
router.post('/cart' , productsController.postCart);
router.get('/orders' , productsController.getOrders);
router.get('/checkout' , productsController.getCheckout);
router.post('/delete-product' , productsController.postCartDeleteProduct);
module.exports = router;