const mongoose = require("mongoose");
const categoryModel = mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
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

module.exports = mongoose.model("category", categoryModel);
