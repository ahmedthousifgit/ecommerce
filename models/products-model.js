const mongoose = require("mongoose");

const productModel = mongoose.Schema({
  image: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  subCategory: {
    type: String,
    require: true,
  },
  regularPrice: {
    type: Number,
    require: true,
  },
  salePrice: {
    type: Number,
    require: true,
  },
  color: {
    type: String,
    require: true,
  },
  createdon: {
    type: Date,
    require: true,
  },
  taxrate: {
    type: String,
    require: true,
  },
  units: {
    type: Number,
    require: true,
  },
  verified: {
    type: String,
    default: 0,
  },
  isListed: {
    type: String,
    default: 0,
  },
});
module.exports = mongoose.model("products", productModel);
