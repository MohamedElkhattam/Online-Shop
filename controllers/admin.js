const Product = require('../models/product');

exports.getAddProduct = function(req, res, next){
    res.render('admin/edit-product' , { pageTitle:'Add Product' , path :'/admin/add-product' , editing:false});
    // second parameter data passed as variabels(object) to view template (object) {key:value}
    // set content type automatically there is no need for res.setHeader('Content-Type')
}

exports.postAddProduct = function(req, res, next){
    //req.body feature express.js but need to be parsed
    const title= req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body. description;
    req.user
        .createProduct({  
            title:title,
            imageUrl:imageUrl,
            price:price,
            description:description,
        })
        .then(()=>res.redirect('/admin/products'))
        .catch(err=>console.log(err)) 
}

//pre populating is render Content in the input fileds of form 
exports.getAdminEditProduct = function(req, res, next){
    //any check for query params is in controller (?key=value&key=value)
    const prodcuId = req.params.productId
    const editMode = req.query.edit; // this extracts the value or undefined put in the variable as "String" 
    if(!editMode)
        return res.redirect('/');
    req.user.getProducts({ where: {id: prodcuId}}) // returns array of products
        .then((products)=>{
            const product = products[0]
            res.render('admin/edit-product' , {pageTitle:'Editing Product' , 
            path :'/admin/edit-product' , editing:editMode , product:product}
        );
        })
        .catch(err=>console.log(err))
}

exports.postAdminEditProduct = (req , res , next)=>{
    const id = req.body.productId
    const title = req.body.title 
    const imageUrl = req.body.imageUrl 
    const price = req.body.price
    const description = req.body.description
    Product.findByPk(id)
        .then((product)=>{
            // These assigns will not change the DataBase
            product.title = title; 
            product.description = description; 
            product.imageUrl = imageUrl;
            product.price = price;
            return product.save(); 
            //return promise from (findbypk fnc) add then of returned promise / one catch will catch both promises
        })
        .then(()=>{
            res.redirect('/admin/products');
        })
        .catch(err=>console.log(err))
}

exports.getAdminListProduct = function(req, res, next){
    req.user.getProducts()
        .then((products)=>{
            res.render('admin/products' , { pageTitle:'Admin Products' , 
                path :'/admin/products' , prods:products });
        })
        .catch(err=>console.log(err))
}

exports.postDeleteProduct = (req ,res ,next)=>{
    const productId = req.body.productId;
    // Product.destroy({where:{id:productId}});
    Product.findByPk(productId)
        .then(prod=>{
            return prod.destroy();
        })
        .then(()=>{
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err=>console.log(err));
}