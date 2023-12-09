var express = require("express");
var router = express.Router();
const userController = require("../controller/userController");
const cartController = require('../controller/cartController')
const productController = require('../controller/product-controller')
const User = require("../models/user");
const { use } = require("../config/emailSender");
const auth = require('../middleware/auth')

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
router.get("/show-products",auth.isLogged, productController.productShow);

router.get('/product-details',auth.isLogged,userController.productDetail)

router.get('/brand/:id',auth.isLogged,productController.brandWise)

//PROFILE
router.get('/account',auth.isLogged,userController.account)

router.get('/edit-profile',auth.isLogged,userController.editProfile)

router.post('/edit-profile',userController.updateProfile)

router.get('/add-address',auth.isLogged,userController.addressForm)

router.post('/add-address',userController.addAddress)

router.get('/edit-address',userController.editAddress)

router.post('/edit-address',userController.updateAddress)

router.post('/remove-address/',auth.isLogged,userController.removeAddress)

//CART
router.get('/cart', cartController.showCart )

router.post('/cart',cartController.addToCart)

router.post('/update-quantity',auth.isLogged,cartController.updateQuantity);

router.post('/removeFromCart',auth.isLogged,cartController.removeFromCart)

router.get('/cart-count',auth.isLogged, cartController.cartCount)

router.post('/buy-now',auth.isLogged,cartController.buyNow)

router.get('/buy-now',auth.isLogged,cartController.buyNow)

router.post('/checkout',auth.isLogged,cartController.checkout)

//RAZORPAY

router.post('/razorpay-order', auth.isLogged, cartController.createRazorpayOrder);

router.post('/create-order',auth.isLogged,cartController.createOrder)


// HOME PAGE NAV

router.get("/men", auth.isLogged,userController.menPage);

router.get("/women",auth.isLogged, userController.womenPage);

router.get("/kids",auth.isLogged,userController.kidPage);

router.get("/items", auth.isLogged, userController.productPage);

router.get("/account", auth.isLogged,userController.accoutPage);

//ORDER DETAILS

router.get('/order-list',auth.isLogged,userController.orderList);

router.get('/order-details/:orderId',auth.isLogged,userController.orderDetails)

router.get('/checkout-address',auth.isLogged,userController.checkoutAdd)

router.post('/checkout-submitAdd',userController.checkoutAddress)

router.post('/order-cancel',userController.cancelOrder)

router.post('/order-return', userController.returnOrder);



//LOGOUT
router.get("/logout", userController.logOut);

module.exports = router;
