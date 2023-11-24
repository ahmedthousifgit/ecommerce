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
router.get("/dashboard",adminController.dashboard);

//CATEGORY
router.get("/categories", adminController.adminCategoryForm);

router.post("/categoryForm",upload.single("image"),adminController.submitCategory);

router.get('/listCategory/:categoryId',adminController.listCategory)

router.get('/unlistCategory/:categoryId',adminController.unlistCategory)

router.get('/deleteCategory/:categoryId',adminController.deleteCategory)


//PRODUCT
router.get("/add-product", adminController.addProductForm);

router.post("/add-product",update.array("image",4), adminController.addProduct);

router.get("/product-list", adminController.listProduct);

//EDIT PRODUCTS
router.get('/edit-products/:productId',adminController.editProductForm)

router.post('/edit-products/:productId',update.array("image",4),adminController.editedProducts)

router.get('/deleteProduct/:productId',adminController.deleteProduct)

//USERLIST
router.get('/users-list',adminController.users)

router.get('/blockUser/:userId', adminController.blockUser);

router.get('/unblockUser/:userId', adminController.unblockUser);

//ORDERS
router.get('/orders',adminController.orderList)

router.get('/orderDetails/:orderId',adminController.orderDetails)

router.get('/delivered',adminController.delivered)

// router.get('/orderStatus',adminController.orderStatus)

// router.get('/changeStatus',adminController.changeStatus)

router.post('/updateOrderStatus',adminController.updateOrderStatus)

//LOGOUT
router.get("/logout", adminController.logOut);

module.exports = router;
