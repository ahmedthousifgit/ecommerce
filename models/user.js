const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  mobile: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  verified: {
    type: String,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  cart: {
    type: Array,
  },
  token: {
    type: String,
    default: "",
  },
  wishList: {
    type: Array,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  history: {
    type: Array,
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
});
userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
