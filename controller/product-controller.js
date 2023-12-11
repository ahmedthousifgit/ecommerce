const Product = require("../models/products-model");
const Categories = require("../models/category");
const User = require("../models/user");
const { log } = require("debug/src/node");
const { parse } = require("dotenv");

exports.productShow = async (req, res) => {
  try {
    const categories = await Categories.find();
    const currentPage = parseInt(req.query.page) || 1;
    const productsPerPage = 6;
    // Calculate the number of products to skip
    const skip = (currentPage - 1) * productsPerPage;
    const products = await Product.find({ verified: 0, isListed: true })
      .skip(skip)
      .limit(productsPerPage);
    const totalProducts = await Product.countDocuments({
      verified: 0,
      isListed: true,
    });
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    // const products = await Product.find({ verified: "0", isListed: true });
    const user = await User.findById(req.session.userId);
    res.render("user/items", {
      username: User.name,
      categories,
      products,
      currentPage,
      totalPages,
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
    const currentPage = parseInt(req.query.page) || 1;
    const productsPerPage = 6;
    // Calculate the number of products to skip
    const skip = (currentPage - 1) * productsPerPage;
    const totalProducts = await Product.countDocuments({
      verified: 0,
      isListed: true,
    });
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const brand = req.query.id;
    let products;
    if (brand) {
      products = await Product.find({
        category: brand,
        isListed: true,
      })
        .skip(skip)
        .limit(productsPerPage);
    } else {
      products = await Product.find({ isListed: true })
        .skip(skip)
        .limit(productsPerPage);
    }
    res.render("user/items", {
      username: User.name,
      categories,
      products,
      brand,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.priceWise = async (req, res) => {
  try {
    const price = req.query.id;
    const user = await User.findById(req.session.userId);
    const categories = await Categories.find({ isListed: true });
    const currentPage = parseInt(req.query.page) || 1;
    const productsPerPage = 6;
    // Calculate the number of products to skip
    const skip = (currentPage - 1) * productsPerPage;
    const totalProducts = await Product.countDocuments({
      verified: 0,
      isListed: true,
    });
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    let products;
    if (price) {
      products = await Product.find({
        $and: [{ salePrice: { $gte: 0 } }, { salePrice: { $lte: price } }],
      })
        .skip(skip)
        .limit(productsPerPage);
    } else {
      products = await Product.find({ isListed: true })
        .skip(skip)
        .limit(productsPerPage);
    }
    // console.log(products);
    res.render("user/items", {
      products,
      username: User.name,
      categories,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.colorWise = async (req, res) => {
  try {
    const selectedColor = req.query.id;
    const user = await User.findById(req.session.userId);
    const categories = await Categories.find({ isListed: true });
    const currentPage = parseInt(req.query.page) || 1;
    const productsPerPage = 6;
    // Calculate the number of products to skip
    const skip = (currentPage - 1) * productsPerPage;
    const totalProducts = await Product.countDocuments({
      verified: 0,
      isListed: true,
    });
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    let products;
    if (selectedColor) {
      products = await Product.find({
        color: selectedColor,
        isListed: true,
      })
      .skip(skip)
        .limit(productsPerPage);
    } else {
      products = await Product.find({ isListed: true })
      .skip(skip)
      .limit(productsPerPage);
    }
    res.render("user/items", {
      products,
      username: User.name,
      categories,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.subCategory = async (req, res) => {
  try {
    const categories = await Categories.find();
    const user = await User.findById(req.session.userId);
    const subCat = req.query.id;
    const currentPage = parseInt(req.query.page) || 1;
    const productsPerPage = 6;
    // Calculate the number of products to skip
    const skip = (currentPage - 1) * productsPerPage;
    const totalProducts = await Product.countDocuments({
      verified: 0,
      isListed: true,
    });
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    let products;
    if (subCat) {
      products = await Product.find({
        subCategory: subCat,
        isListed: true,
      })
      .skip(skip)
      .limit(productsPerPage);
    } else {
      products = await Product.find({ isListed: true })
      .skip(skip)
      .limit(productsPerPage);
    }
    res.render("user/items", {
      products,
      username: User.name,
      categories,
      currentPage,
      totalPages,

    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
