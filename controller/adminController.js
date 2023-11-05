const adminModel = require("../models/admin");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

exports.adminIndex = (req, res) => {
  if (req.session.adminLoggedIn == true) {
    res.render("admin/dashboard");
  } else {
    res.redirect("/admin/login");
  }
};

exports.adminLoggin = (req, res) => {
  if (req.session.adminLoggedIn == true) {
    res.render("admin/dashboard");
  } else {
    res.render("admin/login");
  }
};

exports.authenticateAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await adminModel.findOne({ username });
    if (admin && admin.isAdmin == true) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.adminId = admin._id;
        res.render("admin/dashboard");
      } else {
        return res.status(401).render("admin/login", {
          title: "Admin Login",
          errorMessage: "Invalid username or password. Please try again.",
        });
      }
    }
  } catch (error) {
    console.error("Error in authenticateAdmin:", error);
    return res.status(500).render("admin/login", {
      title: "Admin Login",
      errorMessage: "An error occurred. Please try again later.",
    });
  }
};

exports.adminCategoryForm = async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch the categories
    if (req.session.adminId) {
      res.render("admin/categoryForm", {
        title: "Category management",
        errorMessage: "",
        categories, // Pass the categories to the template
      });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
  }
};


exports.submitCategory = async (req, res) => {
  try {
    const { image, name, description } = req.body;
    const category = new Category({ image, name, description });
    await category.save();

    // Fetch the list of categories and indicate that a submission has occurred
    const categories = await Category.find();
    const isSubmitted = true;

    res.render("admin/categoryForm", { categories, isSubmitted });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};


exports.logOut = (req, res) => {
  req.session.adminLoggedIn = null;
  res.render("admin/login", { errorMessage: "" });
};
