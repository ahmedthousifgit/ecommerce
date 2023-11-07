const adminModel = require("../models/admin");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const Product = require("../models/products-model");

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
      const isError = ''
      res.render("admin/categoryForm", {
        title: "Category management",
        errorMessage: "",
        isError,
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
     const {name,description}= req.body
     const image = req.file.filename
    
     const existingCategory = await Category.findOne({name})
     const categories = await Category.find()

     if (existingCategory) {
      const isError ='category already existed'
      // Category with the same name exists, return an error
      res.render("admin/categoryForm", {categories, isError });
      
     }else{
      const categoryData = {
      name: req.body.name,
      description: req.body.description,
      image: req.file.filename,
      
    }
    const category = new Category(categoryData);
    await category.save();

    // Fetch the list of categories and indicate that a submission has occurred
    const categories = await Category.find();
    const isSubmitted = true;
    const isError = ''
    res.render("admin/categoryForm", { categories, isSubmitted ,isError });
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.addProductForm = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/add-products", { categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      subCategory: req.body.subCategory,
      regularPrice: req.body.regularPrice,
      salePrice: req.body.salePrice,
      createdOn: Date.now(),
      taxRate: req.body.taxRate,
      units: req.body.units,
      image: [req.files[0].filename],
    };

    const product = new Product(productData);
    await product.save();
    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.listProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/product-list", { products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.logOut = (req, res) => {
  req.session.adminLoggedIn = null;
  res.render("admin/login", { errorMessage: "" });
};
