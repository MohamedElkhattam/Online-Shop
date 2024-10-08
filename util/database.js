const mongodb = require("mongodb");
const { MongoClient } = mongodb;

let _db;
// This fnc for connecting and stroing connection to database in (_db)
const mongoConnect = (callback) => {
  MongoClient.connect(
    // If in this part mongodb.net/Shop? 'shop' was not configured mongo will make database called test and inster inside it(default)
    'mongodb+srv://batman_dbAdmin:<Mypassword>@cluster0.89s67.mongodb.net/Shop'
  )
    .then((client) => {
      console.log("Connected!");
      _db = client.db(); // This give us access to (Shop) database
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// This function is to return (access to database) Through instance we connected to (_db) if it exists
/** @returns {mongodb.Db} */
const getDb = () => {
  if (_db) return _db;
  else throw "No database found!";
};

module.exports = { mongoConnect, getDb };
