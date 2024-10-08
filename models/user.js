const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");
const Product = require("./product");

const User = class User {
  constructor(email, password, cart, _id) {
    this.email = email;
    this.password = password;
    this.cart = cart;
    this._id = _id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product_id) {
    let newQuantity = 1;
    return Product.findById(product_id)
      .then((product) => {
        let upadtedCart;
        upadtedCart = [...this.cart.items];
        const foundItemIndex = upadtedCart.findIndex((item) => {
          return item.productId.toString() === product._id.toString();
        });
        if (foundItemIndex >= 0) {
          // i will adjust the qnatity only here
          newQuantity = this.cart.items[foundItemIndex].quantity;
          upadtedCart[foundItemIndex].quantity = newQuantity + 1;
        } else
          upadtedCart.push({
            productId: new mongodb.ObjectId(product._id),
            quantity: newQuantity,
          });
        const db = getDb();
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: upadtedCart } } }
          ); // will return a promise
      })
      .catch((err) => console.log(err));
  }

  getCartItems() {
    if (!this.cart || !this.cart.items) {
      return Promise.resolve([]); // Return an empty array if cart is not defined
    }
    const db = getDb();
    const productIds = this.cart.items.map((item) => {
      return item.productId;
    });
    //return cursor with all matching products with the given array
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        // i want to add The Quantity for every product
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((element) => {
              return element.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      })
      .catch((err) => console.log(err));
  }

  deleteCartItem(prodId) {
    const remainingItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== prodId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: remainingItems } } }
      );
  }

  getOrderItems() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id) })
      .toArray()
      .then((orders) => {
        return orders;
      })
      .catch((err) => console.log(err));
  }

  addToOrders() {
    return this.getCartItems().then((products) => {
      const order = {
        items: products,
        user: {
          _id: new mongodb.ObjectId(this._id),
          email: this.email,
        },
      };
      const db = getDb();
      return db
        .collection("orders")
        .insertOne(order)
        .then(() => {
          return db
            .collection("users")
            .updateOne(
              { _id: new mongodb.ObjectId(this._id) },
              { $set: { cart: { items: [] } } }
            );
        })
        .catch((err) => console.log(err));
    });
  }

  static saveNewPassword(newPassword, userId) {
    const db = getDb();
    return db.collection("users").findOneAndUpdate(
      { _id: new mongodb.ObjectId(userId) },
      {
        $set: { password: newPassword },
        $unset: { resetToken: "", tokenExpirationDate: "" },
      }
      //Removing the token settings from the user
    );
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) });
  }

  static findUser(receivedMail) {
    const db = getDb();
    return db.collection("users").findOne({ email: receivedMail });
  }

  static findUserByToken(token) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ resetToken: token, tokenExpirationDate: { $gt: new Date() } });
  }

  static findAndUpdate(receivedMail, resetToken, tokenExpirationDate) {
    const db = getDb();
    return db
      .collection("users")
      .findOneAndUpdate(
        { email: receivedMail },
        { $set: { resetToken, tokenExpirationDate } }
      );
  }
};
module.exports = User;
