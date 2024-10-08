const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express(); // the only function exported from express Definition File(type script)
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart')
const CartProduct = require('./models/cart-product');

app.set('view engine' , 'ejs'); //set global configurations
//view engine tell express for any dynamic content use this engine provided (pug) to compile them
app.set('views' , 'views') //you will find dyanmic views in views folder

app.use(bodyParser.urlencoded({extended:false})); //parse body that is sent from (form)
app.use(express.static(path.join(__dirname , 'public')));

app.use((req , res , next)=>{ //Global Middleware applied to all requests
    //app.use only register middleware to be excuted for incoming request so 
    //receiving request means server started and have reached app.listen which means there must be exising user
    User.findByPk(1)
        .then(user => {
            req.user = user ; // store user in the request
            // sotored user is not java script object but sequelize object with all sequelize methods
            next();
        })
        .catch(err => console.log(err))
})
app.use('/admin',adminRoutes); //Add common starting segement (Filtering)
app.use(shopRoutes);
app.use((req , res )=>{ // last middleware doesn't have next as there is no next middelware to be called 
    res.status(404).render('404' , {pageTitle:'Error 404' , path:'/404'});
    // returning error 404 for unknown paths that will reach this middleware
});
 
//association -> one to many is {Product.belongsTo User} /{User hasMany Product} / cascade is the default in update
Product.belongsTo(User ,{ constraints:true , onDelete:'CASCADE' });
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product , { through: CartProduct });
Product.belongsToMany(Cart , { through: CartProduct });

let currentUser;
// npm start exectue this code first and then call app.listen
sequelize   //sync( {force: true} ) {force:true}
    .sync() //prodcut table is already Created so to force modify table use force drops and recreated it
    .then(()=>{
       return User.findByPk(1);
    })
    .then(user => { 
        if(!user)
            return User.create({ name:'Mohamed' , email:'user1@mail.com' });
        else
            return user; // Returning value in then block returns promise not user object
    })
    .then(user => {
        currentUser = user;
        return user.getCart()
    })
    .then((cart) =>{
        if(!cart)
            return currentUser.createCart();
        else
            return cart
    })
    .then(()=>{
        app.listen(3000)
    })
    .catch(err => console.log(err) );