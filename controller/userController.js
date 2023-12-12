const User = require("../models/user");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Product = require("../models/products-model");
const Category = require("../models/category");
const {sendOtp} = require('../utility/nodemailer')
const {generateOTP} = require('../utility/nodemailer')
const {sendVerifymail}=require('../utility/nodemailer')
const { formatDate } = require('../utility/formatDate');
const Address = require('../models/address-model');
const Order= require('../models/order-model')
const { json } = require("express");
const randomstring = require('randomstring')
const Razorpay = require('razorpay')

var instance = new Razorpay({
  key_id: 'rzp_test_mu3Z5SNU9tR58R',
  key_secret: 'Oh5tMzxzueElUJUzM3Oo8fCa',
});

exports.home = async (req, res) => {
  try{
    if(req.session.userId){
      const user = await User.findById(req.session.userId)
      if(user && user.blocked){
        res.redirect('/login')
      }else{
        res.redirect('/men')
      }
    }else{
    const products = await Product.find();
    res.render("user/index", { products});
    }  
  }catch(error){
    console.error('Error rendering home page:', error);
    res.redirect('/login')
  }
  
};

// signup process
exports.registerUser = async (req, res) => {
  try {
    const emailCheck = req.body.email;
    const checkData = await User.findOne({ email: emailCheck });
    if (checkData) {
      return res.render("user/signup", {
        errorMessage:"User already exists, please try with a new email",
      });
    } else {
      const UserData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        name:req.body.name,
        mobile:req.body.mobile
      };

      const OTP = generateOTP(); /* otp generating */

      req.session.otpUser = { ...UserData, otp: OTP };
      console.log(req.session.otpUser.otp);
      // req.session.mail = req.body.email;

      /** otp sending ***/
      try {
        sendOtp(req.body.email, OTP, req.body.username);
        return res.redirect("/sendOTP");
      } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).send("Error sending OTP");
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};


exports.sendOTPpage = async (req, res) => {
  try {
    if(req.session.userId){
      res.redirect('/men')
    }else{
      const email = req.session.otpUser.email
      res.render('user/verifyOTP', { email })
    }
  } catch (error) {
      throw new Error(error)
  }

}

exports.verifyOTP = async (req, res) => {
  try {
    if(req.session.userId){
      res.redirect('/men')
    }else{

      const enteredOTP = req.body.otp;
      const email = req.session.otpUser.email
      const storedOTP = req.session.otpUser.otp; // Getting the stored OTP from the session
      // console.log(storedOTP);
      const user = req.session.otpUser;

      if (enteredOTP == storedOTP) {
          user.password= await bcrypt.hash(user.password,10)
          const newUser = await User.create(user);
          delete req.session.otpUser.otp;
         
          res.redirect('/login');
       
      } else {
          
          messages = 'Verification failed, please check the OTP or resend it.';
          console.log('verification failed');

      }
      res.render('user/verifyOTP', { email})

  }
  } catch (error) {
      throw new Error(error);
  }
};

exports.
reSendOTP = async (req, res) => {
  try {
    if(req.session.userId){
      res.redirect('/men')
    }
    else{

    
      const OTP = generateOTP() /* otp generating */
      req.session.otpUser.otp = { otp: OTP };
      

      const email = req.session.otpUser.email
      const userName = req.session.otpUser.userName


      /** otp resending ***/
      try {
          sendOtp(email, OTP, userName);
          console.log('otp is sent');
          console.log(OTP)
          return res.render('user/reSendOTP', { email });
      } catch (error) {
          console.error('Error sending OTP:', error);
          return res.status(500).send('Error sending OTP');
      }
  }

  } catch (error) {
      throw new Error(error)
  }
}


exports.verifyResendOTP = async (req, res) => {
  try {
      const enteredOTP = req.body.otp;
      console.log(enteredOTP);
      const storedOTP = req.session.otpUser.otp;
      console.log(storedOTP);

      const user = req.session.otpUser;

      if (enteredOTP == storedOTP.otp) {
        user.password= await bcrypt.hash(user.password,10)
          console.log('inside verification');
          const newUser = await User.create(user);
          if (newUser) {
              console.log('new user insert in resend page', newUser);
          } else { console.log('error in insert user') }
          delete req.session.otpUser.otp;
          res.redirect('/login');
      } else {
          console.log('verification failed');
      }
  } catch (error) {
      throw new Error(error);
  }
};

exports.forgotPassword = async(req,res)=>{
  try{
     if(req.session.userId){
      res.redirect('/men')
     }else{
      res.render('user/forgotpassword')
     }
  }
  catch(error){
    throw new Error(error);
  }
}

exports.forgetpswd = async (req, res) => {
  try {

      const email = req.body.email
      const user = await User.findOne({ email: email });
      if (user) {
          const randomString = randomstring.generate();
          const updateData = await User.updateOne({ email: email }, { $set: { token: randomString } })
          sendVerifymail(user.userName, user.email, randomString);
          res.render('user/forgotpassword', { message: "Please check your mail to reset your password" })
      } else {
          res.render('user/forgotpassword', { message: "user email is incorrect" })
      }

  } catch (error) {
      throw new Error(error)
  }
}


exports.forgetPswdload = async(req,res)=>{

  try {
      const token =req.query.token;        
      const tokenData = await User.findOne({token:token})
      if(tokenData){
          res.render('user/forget-password',{user_id :tokenData._id});

      }else{
          res.render('user/404',{message:"Token is invalid"})
      }
  } catch (error) {
      throw new Error(error)
  }
}

const securePassword = async(password)=>{

  try{
      const passwordHash = await bcrypt.hash(password,10);
      return passwordHash;
  }catch(error){
      console.log(error.message);
  }
}

//forget pswd post--
exports.resetPswd = async(req,res)=>{

  try {
      const password = req.body.password;
      const user_id = req.body.user_id;
      const secure_password = await securePassword(password);

     const updateData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
     res.render('user/login',{errorMessage:'password reset successfully'})

  } catch (error) {
      throw new Error(error)
  }
}


exports.showSignUp = async (req, res) => {
  if (req.session.userId) {
    res.redirect("/men");
  } else {
    res.render("user/signup", { title: "Express", errorMessage: "" });
  }
};

exports.showLogin = async (req, res) => {
  if(req.session.userId){
    res.redirect('/men')
  }
  res.render("user/login", { errorMessage: "" });
};

// login process
exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;
    // Find the user by username using async/await
    const user = await User.findOne({ name });
    if (!user) {
      const errorMessage = "Invalid username or password";
      return res.render("user/login", { errorMessage });
    } else {
      if(user.blocked){
        const errorMessage = "User is blocked. Please contact support.";
        return res.render('user/login',{errorMessage})
      }
      const passwordMatch = await user.verifyPassword(password);
      if (!passwordMatch) {
        const errorMessage = "Invalid password";
        return res.render("user/login", { errorMessage });
      } else {
        req.session.userId = user._id;
        res.redirect('/men')
      }
    }
    // Start a user session
  } catch (err) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.menPage = async (req, res) => {
  try {
  
      const products = await Product.find({ verified: "0", isListed: true });
      const categories = await Category.find()
      const user = await User.findById(req.session.userId)
      res.render("user/men", { products,username:user.name,categories });
    
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.account= async(req,res)=>{
  try{
    
      const user = await User.findById(req.session.userId).populate('addresses')
      if(user && !user.blocked){
        res.render('user/account',{user})
      }else{
        res.redirect('/login')
      }
    
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });

  }
}

exports.addressForm = async(req,res)=>{
  try{
    
      res.render('user/add-address')
   
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.checkoutAdd = async(req,res)=>{
  try{
    
      res.render('user/checkoutAddress')
    
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.addAddress = async (req, res) => {
  try {
    const { name, number, altNumber, pinCode, house, area, landmark, town, state } = req.body;
    const user = await User.findById(req.session.userId);

    if (user) {
      const address = new Address({
        user: user._id,
        name,
        number,
        altNumber,
        pinCode,
        house,
        area,
        landmark,
        town,
        state,
      });

      await address.save();

      user.addresses.push(address);
      await user.save();

      res.redirect('/account')
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.checkoutAddress = async (req, res) => {
  try {
    
    const { name, number, altNumber, pinCode, house, area, landmark, town, state } = req.body;
    const user = await User.findById(req.session.userId);

    if (user) {
      const address = new Address({
        user: user._id,
        name,
        number,
        altNumber,
        pinCode,
        house,
        area,
        landmark,
        town,
        state,
      });
      console.log(address);

      await address.save();

      user.addresses.push(address);
      await user.save();

      res.redirect('/buy-now')
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};




exports.removeAddress= async(req,res)=>{
  try{
    
      const {userId,addressId} = req.body
      const user = await User.findById(userId)
      if(!user){
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      await Address.findByIdAndRemove({user:userId,_id:addressId})
      
      user.addresses.pull(addressId);
      await user.save();
      res.json(true);
  

  }
  catch(error){
    json(false)
  }
}

exports.editAddress = async(req,res)=>{
  try{
    const addressId = req.query.id
    const address = await Address.findById(addressId)
    if(!address){
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    if ( req.query.id) {

    res.render('user/edit-address',{address,addressId})
  } else { 
    res.redirect('/account')
  }
  
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.editProfile = async (req, res) => {
  try {
   
      const userId = req.session.userId;
      const user = await User.findById(userId);
      
      if (user && !user.blocked) {
        res.render('user/edit-profile', { user });
      } else {
        res.redirect('/login');
      }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.updateProfile = async (req,res)=>{
  try{
   const userId = req.session.userId
   const user = await User.findById(userId)
   if(!user){
    return res.status(404).json({ success: false, error: 'User not found' });
   }
   user.name = req.body.name
   user.mobile = req.body.mobile
   await user.save()
   res.redirect('/account')

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }

}


exports.updateAddress= async(req,res)=>{
  try{
    const {id, name, number, altNumber, pinCode, house, area, landmark, town, state }= req.body
    const address = await Address.findById(id)
    if(!address){
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    address.name = name;
    address.number = number;
    address.altNumber = altNumber;
    address.pinCode = pinCode;
    address.house = house;
    address.area = area;
    address.landmark = landmark;
    address.town = town;
    address.state = state;
    await address.save()
    res.redirect('/account')
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}


exports.productDetail= async(req,res)=>{
  try{
    
      const productId = req.query.productId
      const products = await Product.findById(productId)
      if(!products){
        return res.status(404).json({ error: "Product not found" });
      }
      res.render('user/product-details',{products})
      
    
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}



exports.accoutPage = async (req, res) => {
 try{
  res.render("user/account", { title: "Express" });
 } 
 catch(error){
  console.log(error);
    res.status(500).json({ error: "An error occurred" });
 }
    
 
};

exports.productPage = async (req, res) => {
  try{
    const user = await User.findById(req.session.userId)
    const categories = await Category.find({ isListed: true })
    const currentPage = parseInt(req.query.page)|| 1
    const productsPerPage = 6;
    // Calculate the number of products to skip
    const skip = (currentPage - 1) * productsPerPage;
    const products = await Product.find({verified:0,isListed:true})
    .skip(skip)
    .limit(productsPerPage)
    const totalProducts = await Product.countDocuments({verified:0,isListed:true})
    const totalPages = Math.ceil(totalProducts / productsPerPage)
    res.render("user/items", {
      username:user.name ,
      products ,
      categories,
      totalPages,
      currentPage,
    });
  }
  catch(error){
    console.log(error);
      res.status(500).json({ error: "An error occurred" });
   }

};


const ITEMS_PER_PAGE =6
exports.orderList = async(req,res)=>{
  try{
 
      const user = await User.findById(req.session.userId)
      const page = parseInt(req.query.page)
      const totalOrders = await Order.countDocuments({userId:req.session.userId})
      const totalPages = Math.ceil(totalOrders/ITEMS_PER_PAGE)
      const orders = await Order.find({userId:req.session.userId})
      .sort({createdOn:-1})
      .skip((page -1)* ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
      // console.log('&&&&&&&&',orders);
      res.render("user/order-list",{
        username:user.name,
        orders,
        formatDate,
        currentPage: page,
        totalPages
      } )
    
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.orderDetails = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = req.params.orderId;
    
    const [user, order] = await Promise.all([
      User.findById(userId).populate('addresses'),
      Order.findOne({ userId, _id: orderId }).populate('products.product'),
      
    ]);
    const address = await Address.findById({_id:order.address})
    console.log('^^^^^^^^^^^^^^^^^^^');
    console.log(order);
    console.log(order._id);


    if (!user || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    

    res.render('user/order-details', {
      username: user.name,
      user,
      order,
      formatDate,
      address,
      selectedProducts :order.products,
      payment:req.body.paymentMethod || 'cod',

      totalPrice:order.totalPrice
    });
  } catch (error) {
    console.error('Error in orderDetails controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};



exports.cancelOrder = async (req, res) => {
  try {
   
    const orderId = req.body.orderId;
    console.log(orderId);
  
    const order = await Order.findById(orderId).populate('products.product').populate('products.quantity');
    const products = await Product.find()
    
    // console.log(order.status);
    // console.log('+++++++++++++++++++++');
    // console.log(order);
    // console.log('__________');
    // console.log(order.products);

    // Update product stock for each product in the order
    for (const item of order.products) {
      const product = item.product;

     
     
      if (product ) {
        // Increase the product stock by the canceled quantity
        // console.log('item quantity::::::::',item.quantity)
        
        product.units += item.quantity;

        // Save the updated product
        await product.save();
      }else{
        console.log('product not found');
      }
      
      console.log(item.quantity)
    
    }
    order.status = 'Cancel Order'
    await order.save();
    // await Order.findByIdAndUpdate(orderId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in cancelOrder controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


exports.returnOrder= async(req,res)=>{
  try{
    const orderId = req.body.orderId
    const Reason = req.body.reason
    const products = await Product.find()
    const order = await Order.findById(orderId).populate('products.product').populate(products.quantity)
    
    for(const item of order.products ){
      const product = item.product
    
    if(product){
      product.units += item.quantity
      await product.save()
    }
  }
    order.status = 'returned'
    order.reason = Reason
    await order.save()
    res.status(200).json({ success: true });
  }
  
  catch(error){
    console.error('Error in returnOrder controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

exports.wallet= async(req,res)=>{
  try{
    const user = await User.findById(req.session.userId);
    var userData = await User.findOne({ _id: req.session.userId });
    res.render("user/wallet", { isLogged: req.session.userId,userData, username:User.name });
  }
  catch(error){
    console.error('Error in returnOrder controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

exports.addMoney = (req, res) => {
  try {
    var options = {
      amount: req.body.total * 100,
      currency: "INR",
      receipt: "" + Date.now(),
    };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        console.log("Error while creating order : ", err);
      } else {
        var amount = order.amount / 100;
        console.log(amount);
        var x = await User.findByIdAndUpdate(
          req.session.userId,
          {
            $push: {
              history: { amount: amount, status: "credit", date: Date.now() },
            },
          },
          { new: true }
        );
        res.json({ order: order, razorpay: true });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Cannot add amount into your acccount");
  }
};

exports.verifyPayment = async (req, res) => {
  var details = req.body;
  var amount = details["order[order][amount]"] / 100;
  await User.findByIdAndUpdate(req.session.userId, { $inc: { wallet: amount } });
};

exports.history = async(req,res)=>{
  try{
    const userData = await User.findOne({_id:req.session.userId})
    const history = userData.history;
    console.log(history,'jdjhjashfjhs');
    const user = await User.findById(req.session.userId);

    const formattedHistory = history.map((entry)=>{
    const timestamp = entry.date
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`
    return {...entry,formattedDate}
  })
  const wallet = userData.wallet
  const itemsperpage = 15;
  const currentpage = parseInt(req.query.page) || 1;
  const startindex = (currentpage - 1) * itemsperpage;
  const endindex = startindex + itemsperpage;
  const totalpages = Math.ceil(formattedHistory.length / 15);
  var currentHistory = formattedHistory.slice(startindex, endindex);
  res.render('user/history',{
    history: currentHistory,
    username:User.name,
    currentpage,
    totalpages,
    wallet,
  })
  }
  catch(error){
    console.error('Error in returnOrder controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}


exports.logOut = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
};
