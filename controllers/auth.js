const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const { addAbortSignal } = require("stream");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mohamed.elkhattam2@gmail.com",
    pass: "prch otsn tuhm jgje",
  },
});

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "/login",
    path: "/login",
    errorMessage: "",
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findUser(email)
    .then((fetchedUser) => {
      if (!fetchedUser) {
        // req.flash('error', 'Wrong Email or Password.')
        return res.redirect("/login");
      }
      bcrypt.compare(password, fetchedUser.password).then((doMatch) => {
        if (!doMatch) {
          // req.flash('error', 'Wrong Email or Password.')
          return res.redirect("/login");
        }
        console.log(fetchedUser);
        req.session.loggedIn = true;
        // Correctly instantiate the User object
        req.session.user = fetchedUser;
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  const errorMessage = req.session.errorMessage || "";
  const inputFields = req.session.inputFields || "";
  delete req.session.errorMessage;
  delete req.session.inputFields;

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: errorMessage,
    oldInputFields: inputFields,
  });
};

exports.postSignup = (req, res, next) => {
  const error = validationResult(req);
  const { email, password } = req.body;
  User.findUser(email)
    .then((user) => {
      if (user) {
        req.session.errorMessage = "Email already Exists";
        req.session.inputFields = req.body;
        return res.redirect("/signup");
      }
      if (!error.isEmpty()) {
        req.session.errorMessage = error.array()[0].msg;
        req.session.inputFields = req.body;
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 15).then((hashedPassword) => {
        const newUser = new User(email, hashedPassword, { items: [] });
        newUser
          .save()
          .then(() => {
            res.redirect("/login");
            const mailOptions = {
              from: {
                name: "My-Ecommerce",
                address: "mohamed.elkhattam2@gmail.com",
              },
              to: email,
              subject: "Welcome to MyE-commerce",
              html: "<h1>You have successfully registered In My-Ecommerce</h1>",
            };
            return transporter.sendMail(mailOptions);
          })
          .then((result) => console.log(result));
      });
    })
    .catch((err) => console.log(err));
};

exports.postlogout = (req, res, next) => {
  req.session.destroy(() => {
    console.log("Logged Out");
    res.redirect("/");
  });
};

exports.getResest = (req, res, next) => {
  const errorMessage = req.session.errorMessage || "";
  delete req.session.errorMessage;

  res.render("auth/reset-password", {
    path: "/reset",
    errorMessage: "",
    pageTitle: "Reset Password",
    errorMessage: errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  const fetchedEmail = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    const token = buffer.toString("hex");
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    User.findUser(fetchedEmail)
      .then((foundUser) => {
        if (!foundUser) {
          req.session.errorMessage = "The User is not found!";
          return res.redirect("/reset");
        }
        User.findAndUpdate(fetchedEmail, token, expirationDate).then(() => {
          res.redirect("/");
          const mailOptions = {
            from: {
              name: "My-Ecommerce",
              address: "mohamed.elkhattam2@gmail.com",
            },
            to: fetchedEmail,
            subject: "Password Reset",
            html: `<h1>To Reset your password</h1>
					<p>Click on this link to reset your password
						<a href = 'http://localhost:3000/reset/${token}'>Click Me</a>
					</p>`,
          };
          return transporter.sendMail(mailOptions);
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPasswordAdd = (req, res, next) => {
  const token = req.params.token;
  const errorMessage = req.session.errorMessage || "";
  const inputFields = req.session.inputFields || "";

  delete req.session.errorMessage;
  delete req.session.inputFields;

  User.findUserByToken(token)
    .then((user) => {
      if (!user) {
        req.session.errorMessage = "Token Expired.";
        return res.redirect("/reset");
      }
      req.session.userId = user._id;
      return res.render("auth/set-new-password", {
        path: "/new-password",
        pageTitle: "Setting New Password",
        errorMessage: errorMessage,
        oldInputFields: inputFields,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const error = validationResult(req);

  User.findById(req.session.userId)
    .then((user) => {
      delete req.session.userId;
      if (!user) return res.redirect("/");

      if (!error.isEmpty()) {
        req.session.errorMessage = error.array()[0].msg;
        req.session.inputFields = req.body;
        return res.redirect(`/reset/${user.resetToken}`);
      }

      // Check that the new password isn't the same as the current one
      return bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.errorMessage =
            "You Entered last used password. Enter a new one.";
          req.session.inputFields = req.body;
          return res.redirect(`/reset/${user.resetToken}`);
        }

        return bcrypt.hash(password, 15).then((hashedPassword) => {
          User.saveNewPassword(hashedPassword, user._id).then(() => {
            console.log("Password updated successfully.");
            return res.redirect("/login");
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
