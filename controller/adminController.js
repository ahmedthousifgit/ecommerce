const adminModel = require("../models/admin");
const Category = require("../models/category");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const path = require('path')
const sharp = require('sharp')
const Product = require("../models/products-model");
const User = require("../models/user");
const { formatDate } = require("../utility/formatDate");
const category = require("../models/category");
const Order = require("../models/order-model");
const Address = require("../models/address-model");
const multer = require("../multer/multers");
const adminAuth = require("../middleware/auth");
const update = multer.update;
const upload = multer.upload;


exports.authenticateAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await adminModel.findOne({ username });
    if (admin && admin.isAdmin == true) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.adminId = admin._id;
        res.redirect("/admin/dashboard");
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

// exports.adminIndex = (req, res) => {
//   if (req.session.adminId) {
//     res.redirect("/admin/dashboard");
//   }
//   const errorMessage = "";
//   res.render("admin/login", { errorMessage });
// };

exports.adminLoggin = (req, res) => {
  try {
    if (req.session.adminId) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/login", { errorMessage: "" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.loadHome = async (req, res) => {
  try {
    const orderCount = await Order.find({}).count();
    const productCount = await Product.find({}).count();
    const order = await Order.find({})
      .sort({ _id: -1 })
      .limit(10)
      .populate("userId");
    const orders = await Order.find({}).populate("userId");
    const products = await Product.find();

    const aggregationResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } },
    ]);

    // monthly sale
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: "delivered", // Filter by status
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdOn",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlySales.find((item) => item._id === index + 1);
      return monthData ? monthData.count : 0;
    });
    // monthly sale end
    const productsPerMonth = Array(12).fill(0);
    products.forEach((product) => {
      const creationMonth = product.createdOn.getMonth();
      productsPerMonth[creationMonth]++;
    });
    //------------order ststus--------------------

    const orderStatus = await Order.aggregate([
      {
          $match: {
              status: {
                  $in: ['delivered', 'pending', 'Cancel Order', 'Out of delivery']
              }
          },
      },
      {
          $group: {
              _id: '$status', // Group by status instead of month
              count: { $sum: 1 },
          },
      },
      {
          $sort: {
              '_id': 1,
          },
      },
  ]);

  const orderStatusArray = Array.from({ length: 4 }, (_, index) => {
      const status = ['delivered', 'pending', 'Cancel Order', 'Out of delivery'][index];
      const statusData = orderStatus.find((item) => item._id === status);
      return statusData ? statusData.count : 0;
  });
  
console.log(orderStatusArray);
//-----------end order status

    //---------product graph---------------
  
    const totalRevenue =
      aggregationResult.length > 0 ? aggregationResult[0].totalPrice : 0;
 

    res.render("admin/dashboard", {
      title: "Admin dashboard",
      errorMessage: "",
      orderCount,
      productCount,
      order,
      products,
      monthlySalesArray,
      productsPerMonth,
      totalRevenue,
      orders,
      orderStatusArray,
      formatDate
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.adminCategoryForm = async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch the categories

    const isError = "";
    res.render("admin/categoryForm", {
      title: "Category management",
      errorMessage: "",
      isError,
      categories, // Pass the categories to the template
    });
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

exports.listCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findByIdAndUpdate(categoryId, {
      isListed: true,
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.unlistCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findByIdAndUpdate(categoryId, {
      isListed: false,
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findByIdAndRemove(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Product not found" });
    }
    // res.redirect("/admin/categories");
    res.status(200).json({ success: true, redirectTo: "/admin/categories" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.addProductForm = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });
    res.render("admin/add-products", { categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
};

exports.addProduct = async (req, res) => {
  let x = req.body.size;
  try {
    const imageData = [];
    const imageFiles = req.files;

    for (const file of imageFiles) {
      console.log(file, "File received");

      const randomInteger = Math.floor(Math.random() * 20000001);
      const imageDirectory = path.join('public', 'uploads', 'products');
      const imgFileName = "cropped" + randomInteger + ".jpg";
      const imagePath = path.join(imageDirectory, imgFileName);

      console.log(imagePath, "Image path");

      const croppedImage = await sharp(file.path)
        .resize(471, 471, {
          fit: "cover",
        })
        .toFile(imagePath);

      if (croppedImage) {
        imageData.push(imgFileName); 
      }
    }
    const productData = {
      
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      subCategory: req.body.subCategory,
      regularPrice: req.body.regularPrice,  
      salePrice: req.body.salePrice,
      createdOn: Date.now(),
      color:req.body.color,
      taxRate: req.body.taxRate,
      units: req.body.units,
      size : x,
      image: imageData
    };

    const product = new Product(productData);
    await product.save();
    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};
const ITEMS_PER_PAGE = 4
exports.listProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const totalProducts = await Product.countDocuments()
    const totalPages = Math.ceil(totalProducts/ITEMS_PER_PAGE)
    const products = await Product.find()
    .sort({createdOn:-1})
    .skip((page-1)* ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    

    res.render("admin/product-list", 
    {
       products,
       currentPage:page,
       totalPages 
    
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

//USERS
exports.users = async (req, res) => {
  try {
    const page= parseInt(req.query.page)
    const totalusers = await User.countDocuments()
    const totalPages = Math.ceil(totalusers/ITEMS_PER_PAGE)
    const users = await User.find()
    .sort({createdOn:-1})
    .skip((page-1)*ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    res.render("admin/users", { users,currentPage:page,totalPages });
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
      res.status(200).json({ success: true, redirectTo: "/admin/users-list" });
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
    const products = await Product.findById(productId);
    console.log(typeof products);
    const categories = await Category.find({ isListed: true });
    res.render("admin/edit-products", { products, categories });
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

    console.log(req.files);

    product.name = req.body.name;
    product.description = req.body.description;
    product.category = req.body.category;
    product.subCategory = req.body.subCategory;
    product.regularPrice = req.body.regularPrice;
    product.salePrice = req.body.salePrice;
    product.taxRate = req.body.taxRate;
    product.units = req.body.units;
    product.image = [
      req.files[0].filename,
      req.files[1].filename,
      req.files[2].filename,
      req.files[3].filename,
    ];
    await product.save();
    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    const products = await Product.findByIdAndUpdate(productId, {
      isListed: true,
    });
    if (!products) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};


exports.unlistProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    const products = await Product.findByIdAndUpdate(productId, {
      isListed: false,
    });
    if (!products) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    console.log("call comes here");
    const productId = req.params.productId;
    console.log("Received productId:", productId);
    const product = await Product.findByIdAndRemove(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ success: true, redirectTo: "/admin/product-list" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};


exports.orderList = async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const totalOrders = await Order.countDocuments({}).populate('userId')
    const totalPages = Math.ceil(totalOrders/ITEMS_PER_PAGE)
    const orders = await Order.find({}).populate("userId")
    .sort({createdOn:-1})
    .skip((page-1)*ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    res.render("admin/orderList", {
      orders,
      formatDate,
      totalPages,
      currentPage:page
    });

    //  console.log(orders.user);
    // console.log(orders.user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.orderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orders = await Order.findOne({ _id: orderId })
      .populate("products.product")
      .populate("userId");

    const addressId = orders.address[0];
    const address = await Address.findOne({ _id: addressId });

    res.render("admin/orderDetails", {
      address,
      orders,
      orderProducts: orders.products,
      formatDate,
    });
    // console.log(orders);
    // console.log('-----------------');
    // console.log(orders.products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.delivered = async (req, res) => {
  await order
    .updateOne({ _id: req.body.id }, { status: "2" })
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      console.log(err);
      res.json(false);
    });
};

exports.updateOrderStatus = async (req, res) => {
  try {
    console.log("inside::::::::orderstatus");
    const { orderId, status } = req.body;

    console.log("orderID::::" + orderId);
    console.log("status " + status);
    // console.log(status,orderId);
    if (!status || !orderId) {
      return res.status(400).json({ error: "Invalid input parameters" });
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status: status } },
      { new: true }
    );
    console.log(updatedOrder);
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ success: true, updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.orderStatus = async (req, res) => {
  if (req.query.status == "all") {
    res.redirect("/adminOrders");
  } else {
    var orders = await Order.find({ status: req.query.status });
  }
  res.render("admin/orderList", { orders });
};

exports.changeStatus = async (req, res) => {
  await order
    .findByIdAndUpdate(req.query.id, { $set: { status: req.query.status } })
    .lean()
    .then((data) => {
      res.redirect(`/admin/details?id=${req.query.id}`);
    });
};

exports.logOut = (req, res) => {
  req.session.adminId = null;
  res.redirect("/admin");
};
