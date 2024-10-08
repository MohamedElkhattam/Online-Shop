const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const secureRoute = require("../middlewares/secureRoutes");
const { check } = require("express-validator");

router.get("/add-product", secureRoute, adminController.getAddProduct);
router.post(
  "/add-product",
  //check("imageUrl"),
  check("title", "Invalide title").isLength({ min: 5 }),
  check("price", "Please enter valid number.").isNumeric(),
  check("description", "Enter Description").isLength({ min: 10 }),
  adminController.postAddProduct
);
router.get(
  "/edit-product/:productId",
  secureRoute,
  adminController.getAdminEditProduct
);
router.post(
  "/edit-product",
  check("title", "Invalide title").isLength({ min: 5 }),
  check("price", "Please enter valid number.").isNumeric(),
  check("description", "Enter Description").isLength({ min: 10 }),
  secureRoute,
  adminController.postAdminEditProduct
); //No Need For id in Post
router.get("/products", secureRoute, adminController.getAdminListProduct);
router.post("/delete-product", secureRoute, adminController.postDeleteProduct);
module.exports = router;
