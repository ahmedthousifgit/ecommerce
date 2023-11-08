const adminModel = require("../models/admin");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const Product = require("../models/products-model");
const User = require("../models/user");

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

exports.dashboard = async (req, res) => {
  if (req.session.adminId) {
    res.render("admin/dashboard", {
      title: "Admin dashboard",
      errorMessage: "",
    });
  } else {
    res.redirect("/");
  }
}

exports.adminCategoryForm = async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch the categories
    if (req.session.adminId) {
      const isError = "";
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
    const { name, description } = req.body;
    const image = req.file.filename;

    const existingCategory = await Category.findOne({ name });
    const categories = await Category.find();

    if (existingCategory) {
      const isError = "category already existed";
      // Category with the same name exists, return an error
      res.render("admin/categoryForm", { categories, isError });
    } else {
      const categoryData = {
        name: req.body.name,
        description: req.body.description,
        image: req.file.filename,
      };
      const category = new Category(categoryData);
      await category.save();

      // Fetch the list of categories and indicate that a submission has occurred
      const categories = await Category.find();
      const isSubmitted = true;
      const isError = "";
      res.render("admin/categoryForm", { categories, isSubmitted, isError });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.listCategory = async(req,res)=>{
  try{
    const categoryId = req.params.categoryId
    const category =  await Category.findByIdAndUpdate(categoryId, { isListed: true })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.redirect('/admin/categories');
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.unlistCategory = async(req,res)=>{
  try{
    const categoryId = req.params.categoryId
    const category =  await Category.findByIdAndUpdate(categoryId, { isListed: false })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.redirect('/admin/categories');
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.addProductForm = async (req, res) => {
  try {
    const categories = await Category.find({isListed:true});
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

//USERS
exports.users = async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin/users", { users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      user.blocked = true; // Unblock the user
      await user.save();
      res.redirect("/admin/users-list");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      user.blocked = false; // unblock the user
      await user.save();
      res.redirect("/admin/users-list");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.editProductForm = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    const categories = await Category.find()
    res.render("admin/edit-products", { product,categories});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.editedProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.name = req.body.name;
    product.description = req.body.description;
    product.category = req.body.category;
    product.subCategory = req.body.subCategory;
    product.regularPrice = req.body.regularPrice;
    product.salePrice = req.body.salePrice;
    product.taxRate = req.body.taxRate;
    product.units = req.body.units;
    product.image = req.files[0].filename;

    await product.save();
    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.deleteProduct = async(req,res)=>{
  try{
    const productId = req.params.productId
    const product = await Product.findByIdAndRemove(productId)
    if(!product){
      return res.status(404).json({ error: 'Product not found' });
    }
    res.redirect('/admin/product-list')
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

exports.logOut = (req, res) => {
  req.session.adminLoggedIn = null;
  res.render("admin/login", { errorMessage: "" });
};
