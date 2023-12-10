const Product = require("../models/products-model");
const Categories = require("../models/category");
const User = require("../models/user");
const { log } = require("debug/src/node");


exports.productShow = async (req, res) => {
  try {
    const categories = await Categories.find();
    const products = await Product.find({ verified: "0", isListed: true });
    const user = await User.findById(req.session.userId)
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


exports.brandWise = async(req,res)=>{
  try{
    const categories = await Categories.find();
    const user = await User.findById(req.session.userId)
    const brand = req.params.id;
    let products;
    console.log(brand);
    if(brand){
     console.log("hi")
     products = await Product.find({
      category:brand,
      isListed:true,
     })
    }else{
      products = await Product.find({isListed:true})
    }
    console.log(products,"========================");
     res.render('user/items',{
      username:User.name,
      categories,
      products,
      brand: brand
    })
  }
  catch(error){
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
}



