const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  altNumber: {
    type: String,
  },
  pinCode: {
    type: String,
    required: true,
  },
  house: {
    type: String,
  },
  area: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  town: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
