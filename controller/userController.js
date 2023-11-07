const User = require("../models/user");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Product = require('../models/products-model')
const Category = require('../models/category')

exports.home = async(req, res, next)=> {
  const products = await Product.find()
  res.render("user/index", { title: "Express", products });
};

// signup process
exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password, name, mobile } = req.body;
    // Check if the username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    }).exec();
    if (existingUser) {
      return res.render("user/signup", {
        errorMessage: "Username or email already exists",
     });
    }

    // Hash the password before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new User instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      mobile,
    });

    // Save the new user to the database
    await newUser.save();
    req.session.user = newUser;
    // Redirect to the appropriate page after successful registration
    res.render("user/men", { errorMessage: "" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" }); // Handle other errors gracefully
  }
};

exports.showLogin = async(req,res)=>{
  res.render('user/login' ,{ errorMessage:"" })
}

// login process
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    // Find the user by username using async/await
    const user = await User.findOne({ username });
    if (!user) {
      const errorMessage = "Invalid username or password";
      return res.render("user/login", { errorMessage });
    } else {
      const passwordMatch = await user.verifyPassword(password);
      if (!passwordMatch) {
        const errorMessage = "Invalid password";
        return res.render('user/login', { errorMessage });
      } else {
        req.session.userId = user._id;
        const menProducts = await Product.find()
        res.render('user/men',{products : menProducts})
      }
    }
    // Start a user session
  } catch (err) {
  console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};





exports.menPage= async(req,res)=>{
  try{
    console.log('get dufhsa');
      const menProducts = await Product.find()
      console.log(menProducts);
      res.render('user/men',{products : menProducts})
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

