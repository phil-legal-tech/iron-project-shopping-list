// Product model
const mongoose = require('mongoose');
const { stringify } = require('srcset');
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    brand: String,
    name: String,
    weight: String,
    price: Number,
    image: String,
    link: String,
    category: String,
  },
  {
    timestamps: true
  }
);

module.exports = model('Product', productSchema);