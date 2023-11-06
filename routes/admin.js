var express = require("express");
var router = express.Router();
const adminController = require("../controller/adminController");
const auth = require("../middleware/auth");
const multer = require("../multer/multers");
const update = multer.update;
const upload = multer.upload

router.get("/", auth.adminLoggedIn, adminController.adminIndex);

router.get("/admin-login", adminController.adminLoggin);

router.post("/admin-login", adminController.authenticateAdmin);

//dashboard
router.get("/dashboard", (req, res) => {
  if (req.session.adminId) {
    res.render("admin/dashboard", {
      title: "Admin dashboard",
      errorMessage: "",
    });
  } else {
    res.redirect("/");
  }
});

//CATEGORY
router.get("/categories", adminController.adminCategoryForm);

router.post("/categoryForm",upload.single('image'),adminController.submitCategory);

//PRODUCT
router.get("/add-product", adminController.addProductForm);

router.post("/add-product",update.array("image",1),adminController.addProduct);

router.get("/product-list", adminController.listProduct);

//LOGOUT
router.get("/logout", adminController.logOut);

module.exports = router;
