const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, imageUrl, description, id) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDb(); // In monogo Db we Have database(_db) /Collection (products) / Document(title , imageUrl , price , desciption)
        // Collection() into which collection you want to insert something
        //this or any insertion is javascript object not Jsonn but will be converted by mongoDB
        let dbOP;
        if (this._id)
            dbOP = db.collection('products').updateOne({ _id: this._id }, { $set: this });
        else
            dbOP = db.collection('products').insertOne(this);
        return dbOP
            .then(result => {
                console.log(result)
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => {
                return products
            })
            .catch(err => console.log(err))
    }

    static findById(prodId) {
        const db = getDb();
        return db.collection('products').findOne({ _id: new mongodb.ObjectId(prodId) })
            .then(product => {
                return product;
            })
            .catch(err => console.log(err))
    }

    static update(prodId, title, imageUrl, price, desciption) {
        const db = getDb();
        return db.collection('products').updateOne({ _id: new mongodb.ObjectId(prodId) }, { $set: { title: title, imageUrl: imageUrl, price: price, desciption: desciption } })
            .then(result => console.log(result))
            .catch(err => console.log(err))
    }

    static delete(prodId) {
        const db = getDb();
        return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then(() => console.log('Deleted'))
            .catch(err => console.log(err))
    }
}
module.exports = Product;
