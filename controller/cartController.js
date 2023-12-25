const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/products-model");
const Order = require("../models/order-model");
const Coupon = require("../models/coupon");
const Address = require("../models/address-model");
const { addAddress } = require("./userController");
const { Readable } = require("stream");
const Razorpay = require("razorpay");
var easyinvoice = require("easyinvoice");

var razorpay = new Razorpay({
  key_id: "rzp_test_mu3Z5SNU9tR58R",
  key_secret: "Oh5tMzxzueElUJUzM3Oo8fCa",
});

exports.showCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate("cart.productId");

    const totalPrice = user.cart.reduce((total, item) => {
      if (item.product && item.product.offerPrice) {
        return total + item.product.offerPrice * item.quantity;
      }
      return total;
    }, 0);

    const totalAmount = totalPrice;

    res.render("user/cart", {
      cart: user.cart,
      username: user.name,
      totalPrice,
      totalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.userId;

    const existingCartItem = await User.findOne({
      _id: userId,
      "cart.productId": productId,
    });
    if (existingCartItem) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "cart.productId": productId },
        { $inc: { "cart.$.quantity": 1 } },
        { new: true }
      );
      res.redirect("/cart");
    } else {
      const product = await Product.findById(productId);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { cart: { productId, quantity: 1, product } } },
        { new: true }
      );
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const userId = req.session.userId;

    const user = await User.findOne({
      _id: userId,
      "cart.productId": productId,
    });
    console.log(user);

    if (user) {
      const currentQuantity = user.cart.find(
        (item) => item.productId === productId
      ).quantity;

      let newQuantity;
      if (action === "increment") {
        newQuantity = currentQuantity + 1;
      } else if (action === "decrement") {
        newQuantity = currentQuantity - 1;
      }

      newQuantity = Math.min(15, Math.max(1, newQuantity));

      const productData = await Product.findById(productId);
      console.log(productData);
      if (productData.units >= newQuantity) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId, "cart.productId": productId },
          { $set: { "cart.$.quantity": newQuantity } },
          { new: true }
        );
        const totalAmount = updatedUser.cart.reduce(
          (total, item) => total + item.product.offerPrice * item.quantity,
          0
        );
        res.json({ success: true, cart: updatedUser.cart, totalAmount });
      } else {
        res.status(404).json({ success: false, message: "out of stock" });
      }
    } else {
      res
        .status(404)
        .json({ success: false, message: "Item not found in the cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "An error occurred" });
  }
};

exports.cartCount = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (user && user.cart) {
      const cartCount = user.cart.reduce((count, item) => {
        return count + item.quantity;
      }, 0);
      res.json({ cartCount });
    } else {
      res.json({ cartCount: 0 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.userId;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { cart: { productId: productId } } },
      { new: true }
    );

    if (user) {
      res.json({ message: "Item removed from the cart successfully" });
    } else {
      res.status(404).json({ message: "Item not found in the cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.buyNow = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate("addresses");
    const coupons = await Coupon.find({ status: 1 }).lean();
    const sessionUser = req.session.user;
    const userData = await User.findById(userId);

    if (user && !user.blocked) {
      const totalPrice = user.cart.reduce((total, item) => {
        if (item.product && item.product.offerPrice) {
          return total + item.product.offerPrice * item.quantity;
        }
        return total;
      }, 0);

      if (coupons.length === 0) {
        res.render("user/buy-now", {
          user,
          userData,
          username: user.name,
          coupons: null,
          cart: user.cart,
          addresses: user.addresses,
          paymentMethod: req.query.paymentMethod || "cod",
          totalPrice,
        });
      } else {
        const filteredCoupons = coupons.filter(
          (couponData) => !couponData.user.includes(sessionUser)
        );
        if (filteredCoupons.length === 0) {
          res.render("user/buy-now", {
            user,
            userData,
            username: user.name,
            coupons: null,
            cart: user.cart,
            addresses: user.addresses,
            paymentMethod: req.query.paymentMethod || "cod",
            totalPrice,
          });
        } else {
          res.render("user/buy-now", {
            user,
            userData,
            username: user.name,
            coupons: filteredCoupons,
            cart: user.cart,
            addresses: user.addresses,
            paymentMethod: req.query.paymentMethod || "cod",
            totalPrice,
          });
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in buyNow controller:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { selectedAdd, discountTotal, couponCode } = req.body;

    const user = await User.findById(userId).populate("addresses");
    if (couponCode !== null) {
      const coupons = await Coupon.findOne({ code: couponCode });
      coupons.user.push(userId);
      await coupons.save();
      console.log(coupons);
    }
    if (user && !user.blocked) {
      const selectedAddress = user.addresses.find(
        (address) => address._id.toString() === selectedAdd
      );
      const productIds = user.cart.map((item) => item.productId);

      const selectedProducts = await Product.find({ _id: { $in: productIds } });
      let totalPrice;
      if (totalPrice == discountTotal) {
        totalPrice = user.cart.reduce((total, item) => {
          if (item.product && item.product.offerPrice) {
            return total + item.product.offerPrice * item.quantity;
          }
          return total;
        }, 0);
      } else {
        totalPrice = discountTotal;
      }

      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      let outOfStock = false;
      for (const item of user.cart) {
        const product = selectedProducts.find(
          (p) => p._id.toString() === item.productId
        );

        if (product && product.units < item.quantity) {
          outOfStock = true;
        }
        if (outOfStock) {
          return res.status(400).json({ error: "Insufficient stock" });
        }
      }

      const order = new Order({
        userId: new mongoose.Types.ObjectId(req.session.userId),
        address: selectedAddress,
        payment: req.body.paymentMethod || "cod",

        products: user.cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          pricePerQnt: item.product.offerPrice,
        })),
        totalPrice,
        status: "pending",
      });

      await order.save();

      for (const item of user.cart) {
        const product = selectedProducts.find(
          (p) => p._id.toString() === item.productId
        );

        if (product) {
          product.units -= item.quantity;
          await product.save();
        }
      }

      user.cart = [];
      await user.save();
      res.status(200).json({ success: true });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in buy controller:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.walletPayment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { selectedAdd, discountTotal, couponCode } = req.body;

    const user = await User.findById(userId).populate("addresses");
    if (couponCode !== null) {
      const coupons = await Coupon.findOne({ code: couponCode });
      coupons.user.push(userId);
      await coupons.save();
      console.log(coupons);
    }
    const selectedAddress = user.addresses.find(
      (address) => address._id.toString() === selectedAdd
    );

    const productIds = user.cart.map((item) => item.productId);
    const selectedProducts = await Product.find({ _id: { $in: productIds } });

    let totalPrice;
    if (discountTotal) {
      totalPrice = discountTotal;
    } else {
      totalPrice = user.cart.reduce((total, item) => {
        if (item.product && item.product.offerPrice) {
          return total + item.product.offerPrice * item.quantity;
        }
        return total;
      }, 0);
    }

    if (totalPrice > user.wallet) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    let outOfStock = false;
    for (const item of user.cart) {
      const product = selectedProducts.find(
        (p) => p._id.toString() === item.productId
      );

      if (product && product.units < item.quantity) {
        outOfStock = true;
      }
      if (outOfStock) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
    }

    user.wallet -= totalPrice;
    await user.save();

    const order = new Order({
      userId: new mongoose.Types.ObjectId(req.session.userId),
      address: selectedAddress,
      payment: "wallet",
      products: user.cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        pricePerQnt: item.product.offerPrice,
      })),
      totalPrice,
      status: "pending",
    });

    await order.save();

    for (const item of user.cart) {
      const product = selectedProducts.find(
        (p) => p._id.toString() === item.productId
      );

      if (product) {
        product.units -= item.quantity;
        await product.save();
      }
    }

    user.cart = [];
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in walletPayment controller:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { selectedAdd, discountTotal, couponCode } = req.body;

    if (couponCode !== null) {
      const coupons = await Coupon.findOne({ code: couponCode });
      coupons.user.push(userId);
      await coupons.save();
      console.log(coupons);
    }

    const user = await User.findById(userId).populate("addresses");

    const selectedAddress = user.addresses.find(
      (address) => address._id.toString() === selectedAdd
    );
    const productIds = user.cart.map((item) => item.productId);
    const selectedProducts = await Product.find({ _id: { $in: productIds } });
    let totalPrice;
    if (totalPrice == discountTotal) {
      totalPrice = user.cart.reduce((total, item) => {
        if (item.product && item.product.offerPrice) {
          return total + item.product.offerPrice * item.quantity;
        }
        return total;
      }, 0);
    } else {
      totalPrice = discountTotal;
    }
    console.log(totalPrice);

    const orderOptions = {
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    await razorpay.orders.create(orderOptions, (err, data) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ error: "Error creating Razorpay order" });
      } else {
        console.log("order created", data);
        res.status(201).json({
          success: true,
          order: data,
        });
      }
    });
  } catch (error) {
    console.error("Error in createRazorpayOrder controller:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { selectedAdd, totalPrice } = req.body;

    const user = await User.findById(userId).populate("addresses");
    console.log(user.cart);
    if (user && !user.blocked) {
      const selectedAddress = user.addresses.find(
        (address) => address._id.toString() === selectedAdd
      );
      const productIds = user.cart.map((item) => item.productId);
      const selectedProducts = await Product.find({ _id: { $in: productIds } });
      const order = new Order({
        userId: new mongoose.Types.ObjectId(req.session.userId),
        address: selectedAddress,
        payment: "razorpay",
        products: user.cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          pricePerQnt: item.offerPrice,
        })),
        totalPrice,
        status: "pending",
      });

      await order.save();

      console.log(order);

      for (const item of user.cart) {
        const product = selectedProducts.find(
          (p) => p._id.toString() === item.productId
        );

        if (product) {
          product.units -= item.quantity;
          await product.save();
        }
      }

      user.cart = [];
      await user.save();
      res.json({ success: true, order: order });
    }
  } catch (error) {
    console.error("Error in createRazorpayOrder controller:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.invoice = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = req.params.orderId;
    const [user, order] = await Promise.all([
      User.findById(userId).populate("addresses"),
      Order.findOne({ userId, _id: orderId }).populate("products.product"),
    ]);
    const address = await Address.findById({ _id: order.address });

    res.render("user/invoice", {
      order,
      address,
      user,
      selectedProducts: order.products,
    });
  } catch (error) {
    console.error("Error in createRazorpayOrder controller:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.invoiceDownload = async (req, res) => {
  try {
    const id = req.query.id;

    const userId = req.session.userId;
    const result = await Order.findById({ _id: id })
      .populate("userId")
      .populate("products.product");

    const user = await User.findById({ _id: userId });
    const address = await Address.findById({ _id: result.userId.addresses });

    if (!result || !result.address) {
      return res
        .status(404)
        .json({ error: "Order not found or address missing" });
    }

    const order = {
      id: id,
      total: result.totalPrice,
      date: result.createdOn,
      paymentMethod: result.payment,
      orderStatus: result.status,
      name: address.name,
      mobile: address.number,
      house: address.house,
      pincode: address.pinCode,
      city: address.town,
      state: address.state,
      products: result.products,
    };

    const products = order.products.map((product, i) => ({
      quantity: parseInt(product.quantity),
      description: product.product.name,
      price: parseInt(product.product.offerPrice),
      total: parseInt(result.totalPrice),
      "tax-rate": 0,
    }));

    const isoDateString = order.date;
    const isoDate = new Date(isoDateString);

    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = isoDate.toLocaleDateString("en-US", options);
    const data = {
      customize: {},
      images: {
        background: "",
      },

      sender: {
        company: "Shoes.in",
        address: "Decide Your Feel",
        city: "Ernakulam",
        country: "India",
      },
      client: {
        company: "Customer Address",
        zip: address.name,
        city: address.town,
        address: address.pinCode,
      },
      information: {
        number: "order" + order.id,
        date: formattedDate,
      },
      products: products,
      "bottom-notice": "Happy shoping and visit Shoes.in again",
    };

    let pdfResult = await easyinvoice.createInvoice(data);
    const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

    res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    const pdfStream = new Readable();
    pdfStream.push(pdfBuffer);
    pdfStream.push(null);
    pdfStream.pipe(res);
  } catch (error) {
    console.error("Error in invoiceDownload:", error);
    res.status(500).json({ error: error.message });
  }
};
