const Product = require('../models/product');

exports.getShop = (req ,res ,next)=> {
    Product.findAll().then(products=>
        res.render('shop/index' , { pageTitle:'Home' , path:'/' ,prods:products }))
        .catch((err)=>console.log(err))
}

exports.getProducts= (req, res, next)=> {
    Product.findAll().then(products=>{
        res.render('shop/product-list',{ pageTitle:'Products' , path:'/products' , prods:products })
    })
    .catch(error=> console.log(error));
}

exports.getProductDetails = (req ,res , next)=> {
    const receivedProductId = req.params.productId;
    Product.findByPk(receivedProductId)
    .then((product) => {
        res.render('shop/product-details' , 
            {pageTitle:product.title , path:'/products' , product:product});
    })
    .catch(error => console.log(error))
}

exports.getCart = (req ,res ,next)=> {
    req.user
        .getCart()
        .then(cart =>{
            cart.getProducts().then(products => {
                res.render('shop/cart' , 
                    { pageTitle:'Your Cart' , path:'/cart' , products:products , totalPrice:0});
            })
        })
        .catch(err => console.log(err))
}

exports.postCart = (req ,res ,next)=>{
    const receivedProductId = req.body.productID;
    let fatechedCart ;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fatechedCart = cart
            return cart.getProducts({where: {id:receivedProductId}})
        })
        .then(products => {
            let product;
            if(products.length > 0){
                product = products[0]
                if(product){
                    newQuantity = product.cartProduct.quantity + 1;
                    return product;
                }
            }
            return Product.findByPk(receivedProductId)
        })
        .then(product =>{
            // If Thre retuned  product already exists in in between table Sequleize will upadte the quantity
            return fatechedCart.addProduct(product , { through: {quantity:newQuantity} })
        })
        .then(()=> res.redirect('/cart'))
        .catch(err => console.log(err))
}
exports.postCartDeleteProduct = (req ,res , next) => { 
    const productId = req.body.productId;
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({where:{id:productId}})
        })
        .then(products =>{
            const product = products[0]
            // return product.destroy();
        })
        .then(()=> res.redirect('/cart'))
        .catch(err => console.log(err) )
}
exports.getOrders = (req ,res ,nexr)=> {
    res.render('shop/orders' , {pageTitle:"Orders" , path:'/orders'})
}

exports.getCheckout = (req ,res ,next)=> {
    res.render('shop/checkout' , { pageTitle:'Checkout' , path:'/checkout' })
}