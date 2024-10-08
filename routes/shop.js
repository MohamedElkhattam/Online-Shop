const express = require('express');
const router = express.Router();
const productsController = require('../controllers/shop')
const secureRoute = require('../middlewares/secureRoutes')

router.get('/', productsController.getShop);
router.get('/products', productsController.getProducts);
router.get('/products/:productId', productsController.getProductDetails);
router.get('/cart', secureRoute, productsController.getCart);
router.post('/cart', secureRoute, productsController.postCart);
router.post('/delete-product', secureRoute, productsController.postCartDeleteProduct);
router.get('/orders', secureRoute, productsController.getOrders);
router.post('/orders', secureRoute, productsController.postOrder);

module.exports = router; 