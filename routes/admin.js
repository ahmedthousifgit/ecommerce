var express = require("express");
const session = require('express-session')
var router = express.Router();
const adminController = require("../controller/adminController");
const salesController = require('../controller/salesController')
const couponController = require('../controller/coupon-controller')
const auth = require("../middleware/auth");
const multer = require("../multer/multers");
const update = multer.update;
const upload = multer.upload


//LOGIN
// router.get("/", adminController.adminIndex);

router.get("/", adminController.adminLoggin);

router.post("/" , adminController.authenticateAdmin);

//DASHBOARD
router.get("/dashboard",auth.adminlogged,adminController.loadHome)

//CATEGORY
router.get("/categories", auth.adminlogged,adminController.adminCategoryForm);

router.post("/categoryForm",auth.adminlogged,upload.single("image"),adminController.submitCategory);

router.get('/listCategory/:categoryId',auth.adminlogged,adminController.listCategory)

router.get('/unlistCategory/:categoryId',auth.adminlogged,adminController.unlistCategory)

router.get('/deleteCategory/:categoryId',auth.adminlogged,adminController.deleteCategory)


//PRODUCT
router.get("/add-product",auth.adminlogged, adminController.addProductForm);

router.post("/add-product",auth.adminlogged,update.array("imageData",4), adminController.addProduct);

router.get("/product-list",auth.adminlogged, adminController.listProduct);

// offers
router.get('/offerProduct',auth.adminlogged,adminController.loadProductOffer)

router.post('/updateOffer',auth.adminlogged,adminController.updateProductOffer)

router.get('/offerCategory',auth.adminlogged,adminController.loadCategoryOffer)

router.post('/updateCatogaryOffer',auth.adminlogged,adminController.updateCategoryOffer)

//EDIT PRODUCTS
router.get('/edit-products/:productId',auth.adminlogged,adminController.editProductForm)

router.post('/edit-products/:productId',auth.adminlogged,update.array("image",4),adminController.editedProducts)

router.get('/listproducts/:productId',auth.adminlogged,adminController.listProducts)

router.get('/unlistproducts/:productId',auth.adminlogged,adminController.unlistProducts)

router.get('/deleteProduct/:productId',auth.adminlogged,adminController.deleteProduct)

//USERLIST
router.get('/users-list',auth.adminlogged,adminController.users)

router.get('/blockUser/:userId',auth.adminlogged, adminController.blockUser);

router.get('/unblockUser/:userId',auth.adminlogged, adminController.unblockUser);

//ORDERS
router.get('/orders',auth.adminlogged,adminController.orderList)

router.get('/orderDetails/:orderId',auth.adminlogged,adminController.orderDetails)

router.get('/delivered',auth.adminlogged,adminController.delivered)

router.post('/updateOrderStatus',adminController.updateOrderStatus)


//REPORT
router.get('/sales-report',auth.adminlogged,salesController.salesReport)

router.get('/downloadPdf',auth.adminlogged,salesController.downloadPdf)

//COUPON
router.get('/coupon',auth.adminlogged,couponController.coupon)

router.post('/coupon',auth.adminlogged,couponController.addCoupon)

router.post('/couponStatus',auth.adminlogged,couponController.couponStatus)

//LOGOUT
router.get("/logout", adminController.logOut);

module.exports = router;
