const express = require('express');
const { product } = require('puppeteer');
const Product = require('../models/Product.model');


const router = express.Router();


//diplay all products
router.get('/products', (req, res, next) => {

  let search = req.query.search
  let curentPage = parseInt(req.query.curent)

  if (search == undefined) {
    // let curentPage = parseInt(req.query.curent)
    Product.find().limit(10).skip(curentPage * 10).sort({ brand: 1 }).then((productFromDB) => {
      // console.log(productFromDB)
      res.render('products/index', { products: productFromDB, curentPage: curentPage + 1, nextButton: true })
    })
      .catch(error => `Error while creating a new product: ${error}`);
  } else {
    Product.find({ $or: [{ brand: search }, { name: search }] }).limit(20).skip(curentPage * 10).sort({ brand: 1 }).then((productFromDB) => {
      // console.log(productFromDB)
      res.render('products/index', { products: productFromDB, curentPage: curentPage + 1, nextButton: false })
    })
  }
});

//display product details
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

  Product.findById(id).populate('celebrity')
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
      res.redirect('/products')
    })

    .catch(error => console.log(`Error while updating a single product: ${error}`));
});

//create new product(s)

router.get('/products/new', (req, res) => {

  if (!req.session.user) {
    res.redirect('/login')
  } else {
    Product.find().then((productsArray) => {
      res.render('products/new', { newProductsArray: productsArray });
    })
  }
})

router.post('/products', (req, res, next) => {
  console.log(req.body);
  const { name, brand, price, weight, category } = req.body;

  Product.create({ name, brand, price, weight, category, userID: req.session.user._id })
    // .then(productFromDB => {
    //     return User.findByIdAndUpdate(celebrities, { $push: { posts: productFromDB._id } });
    // })
    .then(() => res.redirect('index'))
  //   .catch(error => `Error while creating a new movie: ${error}`, res.redirect('/movies/new'));
});


//delete product from products list

// router.post('/movies/:id/delete', (req, res, next) => {
//   const { id } = req.params;

//   Movie.findByIdAndRemove(id)
//     .then(() => res.redirect('/movies'))
//     .catch(error => console.log(`Error while deleting a movie: ${error}`));
// });


//display shopping list

//delete product from shopping list

// router.post('/movies/:id/delete', (req, res, next) => {
//   const { id } = req.params;

//   Movie.findByIdAndRemove(id)
//     .then(() => res.redirect('/movies'))
//     .catch(error => console.log(`Error while deleting a movie: ${error}`));
// });



//favorite list? add just what you need oder edit
// router.get('/movies/usermovies', (req, res, next) => {
//   Movie.find({ userID: req.session.user._id }).then((productFromDB) => {
//     // let userMovies =[]
//     // productFromDB.forEach(movie=>{

//     //     if(movie.userID == req.session.user._id){
//     //         userMovies.push(movie)
//     //     }
//     // })
//     // console.log("User moviess----->",userMovies)
//     res.render('movies/usermovies', { userMovies: productFromDB })
//   })

// });


module.exports = router;