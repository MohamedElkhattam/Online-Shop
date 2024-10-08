const Product = require("../models/product");

exports.getShop = (req, res, next) => {
  Product.findAll()
    .then((products) =>
      res.render("shop/index", {
        pageTitle: "Home",
        path: "/",
        prods: products,
      })
    )
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        pageTitle: "Products",
        path: "/products",
        prods: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProductDetails = (req, res, next) => {
  const receivedProductId = req.params.productId;
  Product.findById(receivedProductId)
    .then((product) => {
      res.render("shop/product-details", {
        pageTitle: product.title,
        path: "/products",
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCartItems()
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
        totalPrice: 0,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const receivedProductId = req.body.productID;
  return req.user
    .addToCart(receivedProductId)
    .then(() => {
      console.log("cart Posted");
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .deleteCartItem(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrderItems()
    .then((orders) => {
      console.log("Received Orders Ok!");
      res.render("shop/orders", {
        pageTitle: "Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addToOrders()
    .then((result) => {
      console.log("orders Posted");
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};
