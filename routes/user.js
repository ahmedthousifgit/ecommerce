var express = require("express");
var router = express.Router();
const userController = require("../controller/userController");
const cartController = require('../controller/cartController')
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

router.get('/forgotpassword',userController.forgotPassword)

//FORGOT PASSWORD

router.post('/forget',userController.forgetpswd)

router.get('/forget-password',userController.forgetPswdload)

router.post('/forget-password', userController.resetPswd)

//SHOW PRODUCT
router.get('/product-details',userController.productDetail)


//PROFILE
router.get('/account',userController.account)

router.get('/edit-profile',userController.editProfile)

router.post('/edit-profile',userController.updateProfile)

router.get('/add-address',userController.addressForm)

router.post('/add-address',userController.addAddress)

router.get('/edit-address',userController.editAddress)

router.post('/edit-address',userController.updateAddress)

router.post('/remove-address/',userController.removeAddress)

//CART
router.get('/cart', cartController.showCart )

router.post('/cart',cartController.addToCart)

router.post('/update-quantity', cartController.updateQuantity);

router.post('/removeFromCart',cartController.removeFromCart)

router.get('/cart-count',cartController.cartCount)

router.post('/buy-now',cartController.buyNow)

router.post('/checkout',cartController.checkout)

// HOME PAGE NAV

router.get("/men", userController.menPage);

router.get("/women", userController.womenPage);

router.get("/kids", userController.kidPage);

router.get("/items", userController.productPage);

router.get("/account", userController.accoutPage);

//ORDER DETAILS

router.get('/order-list',userController.orderList);

router.get('/order-details/:orderId',userController.orderDetails)

//LOGOUT
router.get("/logout", userController.logOut);

module.exports = router;
