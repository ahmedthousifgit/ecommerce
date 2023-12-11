const Product = require("../models/products-model");
const Categories = require("../models/category");
const User = require("../models/user");
const { log } = require("debug/src/node");
const { parse } = require("dotenv");

exports.productShow = async (req, res) => {
  try {
    const categories = await Categories.find();
    const products = await Product.find({ verified: "0", isListed: true });
    const user = await User.findById(req.session.userId);
    res.render("user/items", {
      username: User.name,
      isLogged: req.session.userId,
      categories,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.brandWise = async (req, res) => {
  try {
    const categories = await Categories.find();
    const user = await User.findById(req.session.userId);
    const brand = req.params.id;
    let products;
    if (brand) {
      products = await Product.find({
        category: brand,
        isListed: true,
      });
    } else {
      products = await Product.find({ isListed: true });
    }
    res.render("user/items", {
      username: User.name,
      isLogged: req.session.userId,
      categories,
      products,
      brand,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.priceWise = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const categories = await Categories.find({ isListed: true });
    const price = parseFloat(req.params.price);
    console.log("PRICE::::::", price);
    let products;
    if (price) {
      products = await Product.find({
        $and: [{ salePrice: { $gte: 0 } }, { salePrice: { $lte: price } }],
      });
    } else {
      products = await Product.find({ isListed: true });
    }
    console.log(products);
    res.render("user/items", {
      products,
      username: User.name,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
