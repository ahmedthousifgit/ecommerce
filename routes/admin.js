var express = require("express");
const session = require('express-session')
var router = express.Router();
const adminController = require("../controller/adminController");
const auth = require("../middleware/auth");
const multer = require("../multer/multers");
const update = multer.update;
const upload = multer.upload


//LOGIN
router.get("/", adminController.adminIndex);

// router.get("/admin", adminController.adminLoggin);

router.post("/admin", adminController.authenticateAdmin);

//DASHBOARD
router.get("/dashboard",auth.adminlogged,adminController.dashboard);

//CATEGORY
router.get("/categories", auth.adminlogged,adminController.adminCategoryForm);

router.post("/categoryForm",auth.adminlogged,upload.single("image"),adminController.submitCategory);

router.get('/listCategory/:categoryId',auth.adminlogged,adminController.listCategory)

router.get('/unlistCategory/:categoryId',auth.adminlogged,adminController.unlistCategory)

router.get('/deleteCategory/:categoryId',auth.adminlogged,adminController.deleteCategory)


//PRODUCT
router.get("/add-product",auth.adminlogged, adminController.addProductForm);

router.post("/add-product",auth.adminlogged,update.array("image",4), adminController.addProduct);

router.get("/product-list",auth.adminlogged, adminController.listProduct);

//EDIT PRODUCTS
router.get('/edit-products/:productId',auth.adminlogged,adminController.editProductForm)

router.post('/edit-products/:productId',auth.adminlogged,update.array("image",4),adminController.editedProducts)

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

//LOGOUT
router.get("/logout", adminController.logOut);

module.exports = router;
