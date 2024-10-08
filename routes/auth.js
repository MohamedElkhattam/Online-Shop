const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check } = require("express-validator");

router.get("/login", authController.getLogin);
router.post(
  "/login",
  check("email", "Invalid Email address.").isEmpty(),
  check("password", "Invalid password.").isEmpty(),
  authController.postLogin
);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  check("email").isEmail().withMessage("Not Valid Email"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Minimum password length is 8 character"),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Passwords doesn't  match");
    return true;
  }),
  authController.postSignup
);
router.post("/logout", authController.postlogout);
router.get("/reset", authController.getResest);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPasswordAdd);
router.post(
  "/new-password",
  check("password")
    .isLength({ min: 8 })
    .withMessage("Minimum password length is 8 character"),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Passwords doesn't  match");
    return true;
  }),
  authController.postNewPassword
);

module.exports = router;
