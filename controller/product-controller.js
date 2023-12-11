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
    const brand = req.query.id;
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
    const price = req.query.id;
    const user = await User.findById(req.session.userId);
    const categories = await Categories.find({ isListed: true });
    
    console.log("PRICE::::::", price);
    let products;
    if (price) {
      products = await Product.find({
        $and: [{ salePrice: { $gte: 0 } }, { salePrice: { $lte: price } }],
      });
    } else {
      products = await Product.find({ isListed: true });
    }
    // console.log(products);
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


exports.colorWise = async(req,res)=>{
  try{
    const selectedColor = req.query.id;
    console.log(selectedColor,"======");
    const user = await User.findById(req.session.userId);
    const categories = await Categories.find({isListed:true})
    let products;
    if(selectedColor){
        products = await Product.find({
        color: selectedColor,
        isListed:true,

      })
    }else{
      products = await Product.find({isListed:tru})
    }
    res.render("user/items",{
      products,
      username: User.name,
      categories,
    })
  }
  catch(error){
    console.log(error);
    res.status(500).send("Internal Server Error")
  }
}

exports.subCategory = async(req,res)=>{
  try{
    const categories = await Categories.find()
    const user = await User.findById(req.session.userId);
    const subCat = req.query.id
    let products
    if(subCat){
      products = await Product.find({
        subCategory: subCat,
        isListed:true
      })
    }else{
       products = await Product.find({isListed:true})
    }
    res.render('user/items',{
      products,
      username:User.name,
      categories
    })
  }
  catch(error){
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
}
