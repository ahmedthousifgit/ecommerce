const Product = require("../models/products-model");
const Categories = require("../models/category");
const User = require("../models/user");
const { log } = require("debug/src/node");
const category = require("../models/category");

exports.productShow = async (req, res) => {
  try {
    const allCategories = await Categories.find();
    const products = await Product.find({ verified: "0", isListed: true });
    const user = await User.findById(req.session.userId)
    res.render("user/items", {
      username: User.name,
      data: allCategories,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.brandWise = async(req,res)=>{
  try{
    var datas = await Categories.find();
    Categories
    .find({name:req.params.id})
    .then((data)=>{
      var category = data;
      Product.find({category:req.params.id,isListed:"true"})
    })

    res.render('user/items',{
      data :datas,
      cat:category,


    })
  }
  catch(error){
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
}
