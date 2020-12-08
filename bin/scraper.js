const cheerio = require('cheerio')
const mongoose = require('mongoose');
const request = require('request-promise')
const srcset = require('srcset')
const url = require('url')
const ProductModel = require('../models/Product.model')
const DB_NAME = 'shopping-list';

const baseUrl = `https://www.kaufland.de/sortiment/das-sortiment.html`

mongoose

.connect(`mongodb://localhost/${DB_NAME}`, { useNewUrlParser: true })
// .connect('mongodb+srv://Phil_for_law:PHa0tgdAuj0JlYfs@cluster0.hbm6a.mongodb.net/shoppinglist?retryWrites=true&w=majority', { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

// const parseImage = el => {
//   const sets = srcset.parse(el.attr('srcset') || el.data('default'))

//   return {
//     small: url.resolve(baseUrl, sets[0].url),
//     large: url.resolve(baseUrl, sets[1].url)
//   }
// }

const extractResults = $ => {
 // console.log($('.m-offer-tile').html())
  return $('.m-offer-tile').map((i, el) => ({
    brand: $('.m-offer-tile__subtitle', el).text(),
    name: $('.m-offer-tile__title', el).text(),
    weight: $('.m-offer-tile__quantity', el).text(),
    price: $('.a-pricetag__price', el).text().trim(),
    image: $('.a-image-responsive', el).attr('data-src'),
    // image: parseImage($('.a-image-responsive source[media="(min-width: 730px)"]', el)),
    link: url.resolve(baseUrl, $('.m-offer-tile__link', el).attr('href')),
    category: $('.m-shopping-list-button', el).attr('data-category'),
  })).get()
}


const promises = []

const requestOnePage = (i) => {
  console.log("requesting page number " + i)
  const currentPage = `https://www.kaufland.de/sortiment/das-sortiment.pageIndex=${i}.html`
  promises.push(request(currentPage).then(cheerio.load).then(extractResults).then(res => {
    // console.log(res)
     ProductModel.create(res).then(() => {
       if (i <= 128) {

        requestOnePage(i+1)
      } else { mongoose.connection.close() }
    })
  }))
}

requestOnePage(0)

//Promise.all(promises).then(() => )
