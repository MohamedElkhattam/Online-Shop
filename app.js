const express = require("express");
const app = express(); // the only function exported from express Definition File(type script)

// const mongoConnect = require('./util/database').mongoConnect;
const path = require("path");
const { mongoConnect } = require("./util/database");
const session = require("express-session");
const connectMongodbSession = require("connect-mongodb-session")(session); // function

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const csrf = require("csurf");
const csrfProtection = csrf();

//view engine tell express for any dynamic content use this engine provided (ejs) to compile them
app.set("view engine", "ejs"); //set global configurations
app.set("views", "views"); //you will find dyanmic views in views folder

app.use(express.urlencoded({ extended: false })); // Body parser to parse form in views
app.use(express.static(path.join(__dirname, "public")));

const sessionStore = new connectMongodbSession({
  uri: 'mongodb+srv://batman_dbAdmin:<Mypassword>@cluster0.89s67.mongodb.net/Shop',
  collection: "sessions",
});

app.use(
  session({
    //attach the session data to req
    secret: "This is My secret",
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
  })
);

app.use(csrfProtection);

/* 
    Intialize the flash inside session so calling req.flash flash error inside flash inside session
    with this middleware all requests will have a req.flash() function that can be used for flash messages.
    flash works with redirect ensuring that the message is available to the next page that is to be redirected.
 */
app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = new User(user.email, user.password, user.cart, user._id);
        next();
      })
      .catch((err) => console.log(err));
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.loggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes); //Add common starting segement (Filtering)
app.use(shopRoutes);
app.use(authRoutes);

app.use((req, res) => {
  res.status(404).render("404", {
    pageTitle: "Error 404",
    path: "/404",
    isAuthenticated: req.session.loggedIn,
  });
  // last middleware doesn't have next as there is no next middelware to be called
  // returning error 404 for unknown paths that will reach this middleware
});

mongoConnect(() => {
  // Once MongoDB is connected, start the server
  app.listen(3000, () => {
    console.log(`Server is running on port`);
  });
});
