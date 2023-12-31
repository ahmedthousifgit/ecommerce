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
  salePrice: {
    type: Number,
    require: true,
  },
  offerPrice: {
    type: Number,
  },
  hasProductOffer: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    require: true,
  },
  createdOn: {
    type: Date,
    require: true,
  },
  taxRate: {
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
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("products", productModel);
