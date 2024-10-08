const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/admin');

router.get('/add-product',adminController.getAddProduct);
router.post('/add-product' ,adminController.postAddProduct );
router.get('/edit-product/:productId',adminController.getAdminEditProduct);// id is a must
router.post('/edit-product',adminController.postAdminEditProduct); //No Need For id in Post
router.get('/products',adminController.getAdminListProduct);
router.post("/delete-product" , adminController.postDeleteProduct);
module.exports = router;