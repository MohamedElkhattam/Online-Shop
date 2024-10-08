const Product = require("../models/product");
const { validationResult } = require("express-validator");

exports.getAddProduct = function (req, res, next) {
  const errorMessage = req.session.errorMessage || "";
  delete req.session.errorMessage;
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.loggedIn,
    errorMessage: errorMessage,
  });
  // second parameter data passed as variabels(object) to view template (object) {key:value}
  // set content type automatically there is no need for res.setHeader('Content-Type')
};

exports.postAddProduct = function (req, res, next) {
  //req.body feature express.js but need to be parsed
  const error = validationResult(req);
  if (!error.isEmpty()) {
    req.session.errorMessage = error.array()[0].msg;
    return res.redirect("/admin/add-product");
  }
  const product = new Product(
    req.body.title,
    req.body.price,
    req.body.imageUrl,
    req.body.description
  );
  product
    .save()
    .then(() => {
      console.log("Product Created");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

//pre populating is render Content in the input fileds of form
exports.getAdminEditProduct = function (req, res, next) {
  //any check for query params is in controller (?key=value&key=value)
  const editMode = req.query.edit; // this extracts the value or undefined & save it as "String"
  if (!editMode) return res.redirect("/");
  const prodcuId = req.params.productId;
  Product.findById(prodcuId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Editing Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.loggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postAdminEditProduct = (req, res, next) => {
  const product = new Product(
    req.body.title,
    req.body.price,
    req.body.imageUrl,
    req.body.description,
    req.body.productId
  );
  product
    .save()
    .then((res) => {
      console.log(res);
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getAdminListProduct = function (req, res, next) {
  Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        pageTitle: "Admin Products",
        path: "/admin/products",
        prods: products,
        isAuthenticated: req.session.loggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.delete(productId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
