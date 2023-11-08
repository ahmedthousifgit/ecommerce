var express = require("express");
var router = express.Router();
const adminController = require("../controller/adminController");
const auth = require("../middleware/auth");
const multer = require("../multer/multers");
const update = multer.update;
const upload = multer.upload

//LOGIN
router.get("/", auth.adminLoggedIn, adminController.adminIndex);

router.get("/admin-login", adminController.adminLoggin);

router.post("/admin-login", adminController.authenticateAdmin);

//DASHBOARD
router.get("/dashboard",adminController.dashboard);

//CATEGORY
router.get("/categories", adminController.adminCategoryForm);

router.post("/categoryForm",upload.single("image"),adminController.submitCategory);

router.get('/listCategory/:categoryId',adminController.listCategory)

router.get('/unlistCategory/:categoryId',adminController.unlistCategory)


//PRODUCT
router.get("/add-product", adminController.addProductForm);

router.post("/add-product",update.array("image",1),adminController.addProduct);

router.get("/product-list", adminController.listProduct);

//EDIT PRODUCTS
router.get('/edit-products/:productId',adminController.editProductForm)

router.post('/edit-products/:productId',update.array("image",1),adminController.editedProducts)

router.get('/deleteProduct/:productId',adminController.deleteProduct)

//USERLIST
router.get('/users-list',adminController.users)

router.get('/blockUser/:userId', adminController.blockUser);

router.get('/unblockUser/:userId', adminController.unblockUser);

//LOGOUT
router.get("/logout", adminController.logOut);

module.exports = router;
