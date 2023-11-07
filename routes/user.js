var express = require("express");
var router = express.Router();
const userController = require("../controller/userController");
const User = require("../models/user");

/* GET home page. */
router.get("/", userController.home);

router.get("/men", userController.menPage);

router.get("/women", function (req, res, next) {
  if (req.session.userId) {
    res.render("user/women", { title: "Express" });
  } else {
    res.redirect("/login");
  }
});

router.get("/kids", function (req, res, next) {
  if (req.session.userId) {
    res.render("user/kids", { title: "Express" });
  } else {
    res.redirect("/login");
  }
});

router.get("/account", function (req, res, next) {
  if (req.session.userId) {
    res.render("user/account", { title: "Express" });
  } else {
    res.redirect("/login");
  }
});

router.get("/cart", function (req, res, next) {
  if (req.session.userId) {
    res.render("user/cart", { title: "Express" });
  } else {
    res.redirect("/login");
  }
});

router.get("/product", function (req, res, next) {
  if (req.session.userId) {
    res.render("user/product", { title: "Express" });
  } else {
    res.redirect("/login");
  }
});

router.get("/login", userController.showLogin);

router.post("/login", userController.login);

//signup
router.get("/signup", function (req, res, next) {
  if (req.session.userId) {
    res.redirect("/men");
  } else {
    res.render("user/signup", { title: "Express", errorMessage: "" });
  }
});

router.post("/signup", userController.registerUser);

// logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
