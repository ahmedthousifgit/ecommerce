var express = require("express");
var router = express.Router();
const userController = require("../controller/userController");
const User = require("../models/user");


// GET home page
router.get("/",userController.home);

//signup
router.get("/signup", userController.showSignUp);

router.post("/signup", userController.registerUser);

router.get('/sendOTP',userController.sendOTPpage)

router.post('/sendOTP',userController.verifyOTP)

router.get('/reSendOTP',userController.reSendOTP)

router.post('/reSendOTP',userController.verifyResendOTP)

//LOGIN
router.get("/login", userController.showLogin);

router.post("/login", userController.login);

//SHOW PRODUCT
router.get('/product-details',userController.productDetail)


//PROFILE
router.get('/account',userController.account)

router.get('/add-address',userController.addressForm)

router.post('/add-address',userController.addAddress)

router.post('/remove-address/:userId/:addressId',userController.removeAddress)

// HOME PAGE NAV

router.get("/men", userController.menPage);

router.get("/women", userController.womenPage);

router.get("/kids", userController.kidPage);

router.get("/product", userController.productPage);

router.get("/account", userController.accoutPage);

router.get("/cart", userController.cartPage);

//LOGOUT
router.get("/logout", userController.logOut);

module.exports = router;
