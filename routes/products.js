const express = require('express');
const { product } = require('puppeteer');
const Product = require('../models/Product.model');
const User = require('../models/User.model');

const router = express.Router();

// function Sum(){
//   let SUM = +this.price;
//   console.log(SUM);
//   return Sum;
// }
// Sum();

//diplay all products
router.get('/products', (req, res, next) => {

  let search = req.query.search
  let curentPage = parseInt(req.query.curent)
  if (!curentPage) { curentPage = 0 }

  if (!req.session.user) {
    res.redirect('/login')
  } else {


    if (search == undefined) {
      // let curentPage = parseInt(req.query.curent)
      Product.find().limit(7).skip(curentPage * 7).sort({ brand: 1 }).then((productFromDB) => {
        // console.log(productFromDB)
        res.render('products/index', { products: productFromDB, curentPage: curentPage + 1 })
      })
        .catch(error => `Error while creating a new product: ${error}`);
    } else {
      Product.find({ $or: [{ brand: { $regex: ".*" + search + ".*", $options: "i" } }, { name: { $regex: ".*" + search + ".*", $options: "i" } }] }).limit(7).skip(curentPage * 7).sort({ brand: 1 }).then((productFromDB) => {
        // console.log(productFromDB)
        res.render('products/index', { products: productFromDB, curentPage: curentPage + 1, currentSearchTerm: search })
      })
    }
  }
});

//diplay all products on your shopping list

router.get('/products/shoppinglist', (req, res, next) => {
  User.findOne({ _id: req.session.user._id })
    .populate({ path: 'shoppinglist', options: { sort: { category: 1 } } })
    .then(user => {
      console.log(user)
      res.render('products/shoppinglist', { shoppinglist: user.shoppinglist })
    })

});

//create new product(s)

router.get('/products/new', (req, res) => res.render('products/new'));

router.post('/products/new', (req, res) => {
  console.log(req.body);
  const { name, brand, price, weight, image, link, category } = req.body;

  Product.create({ name, brand, price, weight, image, link, category })
    .then(() => res.redirect('/products'))
    .catch(error => `Error while creating a new product: ${error}`);
});


// //display product details
router.get('/products/:id', (req, res, next) => {

  const { id } = req.params;

  Product.findById(id)
    .then(productToEdit => {
      res.render('products/show', productToEdit);
    })
    .catch(error => console.log(`Error while getting a single product for display: ${error}`));
});

//edit product
router.get('/products/:id/edit', (req, res, next) => {

  const { id } = req.params;

  Product.findById(id)
    .then(productToEdit => {
      console.log(productToEdit);
      res.render('products/edit', productToEdit);
    })
    .catch(error => console.log(`Error while getting a single product for edit: ${error}`));
});

router.post('/products/:id/edit', (req, res, next) => {

  const { id } = req.params;
  const { name, brand, price, weight, category } = req.body;

  Product.findByIdAndUpdate(id, { name, brand, price, weight, category }, { new: true })
    .then(() => {
      res.redirect(`/products/${id}`)
    })

    .catch(error => console.log(`Error while updating a single product: ${error}`));
});

//delete product from products list

router.post('/products/:id/delete', (req, res, next) => {
  const { id } = req.params;

  Product.findByIdAndRemove(id)
    .then(() => res.redirect('/products'))
    .catch(error => console.log(`Error while deleting a product: ${error}`));
});


//add an item to the shopping list

router.post('/products/:id/add', (req, res, next) => {
  const { id } = req.params;
  console.log('SESSION =====> ', req.session);

  User.findByIdAndUpdate(req.session.user._id, { $push: { shoppinglist: id } })
    .then((result) => {
      console.log("result ======>", result)
      res.redirect(`/products?curent=${Number(req.query.curent) - 1}&search=${req.query.search}`)
    })
    .catch(error => console.log(`Error while adding a product: ${error}`));
});

//delete an item to the shopping list

router.post('/products/shoppinglist/:id/delete', (req, res, next) => {
  const { id } = req.params;
  console.log('SESSION =====> ', req.session);

  User.findByIdAndUpdate(req.session.user._id, { $pull: { shoppinglist: id } })
    .then((result) => {
      console.log("result ======>", result)
      res.redirect('/products/shoppinglist')
    })
    .catch(error => console.log(`Error while adding a product: ${error}`));
});


module.exports = router;