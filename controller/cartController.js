   const mongoose = require('mongoose')
   const User = require("../models/user");
   const Product = require("../models/products-model");
   const Order = require("../models/order-model");
   const Coupon = require('../models/coupon')
   const { addAddress } = require("./userController");
   const Razorpay = require('razorpay')
 
  var razorpay = new Razorpay({
    key_id: 'rzp_test_mu3Z5SNU9tR58R',
    key_secret: 'Oh5tMzxzueElUJUzM3Oo8fCa',
  });
  
  
exports.showCart = async (req, res) => {
  try {
       const userId = req.session.userId;
       const user = await User.findById(userId).populate("cart.productId");

       const totalPrice = user.cart.reduce((total, item) => {
      // Check if item.product is not null before accessing properties
      if (item.product && item.product.salePrice) {
        return total + item.product.salePrice * item.quantity;
      }
      return total;
    }, 0);

       const totalAmount = totalPrice;
    // console.log(user.cart);
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
       const { productId } = req.body; //hidden productId in productdetails
       const userId = req.session.userId;

       const existingCartItem = await User.findOne({
      _id: userId,
      "cart.productId": productId,
    });
    if (existingCartItem) {
      // If the product is already in the cart, update the quantity
         const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "cart.productId": productId },
        { $inc: { "cart.$.quantity": 1 } },
        { new: true }
      );
      res.redirect("/cart");
    } else {
      // If the product is not in the cart, add it as a new item
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
     
      // Update the quantity based on the action (increment or decrement)
      let newQuantity;
      if (action === "increment") {
        newQuantity = currentQuantity + 1;
      } else if (action === "decrement") {
        newQuantity = currentQuantity - 1;
      }

      // Ensure the new quantity is between 1 and 15
      newQuantity = Math.min(15, Math.max(1, newQuantity));

      // Update the quantity in the cart
         console.log('000000000000000000000000');
      const productData= await Product.findById(productId)
      console.log(productData);
if (productData.units>=newQuantity) {
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, "cart.productId": productId },
    { $set: { "cart.$.quantity": newQuantity } },
    { new: true }
  );
     const totalAmount = updatedUser.cart.reduce(
    (total, item) => total + item.product.salePrice * item.quantity,
    0
  );
  res.json({ success:true, cart: updatedUser.cart, totalAmount });
}else{
  res.status(404).json({success:false, message: "out of stock" });

}
         
    } else {
      res.status(404).json({success:false, message: "Item not found in the cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false, error: "An error occurred" });
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
       const userId = req.session.userId; // Assuming you are using sessions to manage user authentication

    // Use findOneAndUpdate to remove the item from the cart
       const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { cart: { productId: productId } } },
      { new: true }
    );

    // Check if the item was successfully removed
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
    // console.log(req.body);
    try {
        
               const userId = req.session.userId;
               const user = await User.findById(userId).populate('addresses');
               const coupons = await Coupon.find({status:1}).lean();
               const sessionUser = req.session.user;
               const userData = await User.findById(userId)
               console.log(user,"++++++++++++++++++");
               console.log("COUPON:",coupons);
               console.log("USER:",userData);
               
            if (user && !user.blocked) {
                // Check if the user has items in the cart
                

                // Calculate total price
                   const totalPrice = user.cart.reduce((total, item) => {
                    // Check if item.product is not null before accessing properties
                    if (item.product && item.product.salePrice) {
                      return total + item.product.salePrice * item.quantity;
                    }
                    return total;
                  }, 0);
                  console.log("0000000000000000000000");
                  console.log(user.cart);
                if(coupons.length ===0){
                  res.render('user/buy-now', {
                    user,
                    userData,
                    username: user.name,
                    coupons:null,
                    cart: user.cart,
                    addresses: user.addresses,
                    paymentMethod: req.query.paymentMethod || 'cod',
                    totalPrice 
                });
                }else{
                  const filteredCoupons = coupons.filter(
                    (couponData) => !couponData.user.includes(sessionUser)
                  )
                  if(filteredCoupons.length ===0){
                    res.render('user/buy-now', {
                      user,
                      userData,
                      username: user.name,
                      coupons:null,
                      cart: user.cart,
                      addresses: user.addresses,
                      paymentMethod: req.query.paymentMethod || 'cod',
                      totalPrice
                  });
                  }else{
                    res.render('user/buy-now', {
                      user,
                      userData,
                      username: user.name,
                      coupons:filteredCoupons,
                      cart: user.cart,
                      addresses: user.addresses,
                      paymentMethod: req.query.paymentMethod || 'cod',
                      totalPrice 
                  });
                  }
                }

                // Render the buy-now page with user data and addresses
                
            } else {
                res.redirect('/login');
            }
        
    } catch (error) {
        console.error('Error in buyNow controller:', error);
        res.status(500).json({ error: "An error occurred" });
    }
};




//checkou (coupon changes)

exports.checkout = async (req, res) => {
  try {
          const userId = req.session.userId;
          const {selectedAdd,discountTotal,couponCode}=req.body; 
          console.log(couponCode);   
          
          const user = await User.findById(userId).populate('addresses');
          if(couponCode!==null){
            const coupons = await Coupon.findOne({code:couponCode})
            coupons.user.push(userId)
            await coupons.save()
            console.log(coupons);

          }
          if (user && !user.blocked) {
              const selectedAddress = user.addresses.find(address => address._id.toString() === selectedAdd);
              const productIds = user.cart.map(item => item.productId);
              // console.log(productIds,'------------');
              const selectedProducts = await Product.find({ _id: { $in: productIds } });
             let totalPrice
             if(totalPrice==discountTotal){
              totalPrice = user.cart.reduce((total, item) => {
                if (item.product && item.product.salePrice) {
                  return total + item.product.salePrice * item.quantity;
                }
                return total;
              }, 0);
             }else{
              totalPrice=discountTotal
             }
              
              // Check if the user has items in the cart
              // console.log('---------cart-----------------');
              // console.log(user.cart);
              // console.log('---------cart-----------------');
              // console.log(selectedProducts);
              // console.log(productIds);
              if (!user.cart || user.cart.length === 0) {
                  return res.status(400).json({ error: 'Cart is empty' });
              }
              let outOfStock = false
              for(const item of user.cart){
                const product = selectedProducts.find(
                  (p) => p._id.toString() === item.productId
                );
              
                if ( product && product.units < item.quantity) {
                  // return res.status(400).json({ error: 'Insufficient stock' });
                  outOfStock = true;
                }
                if (outOfStock) {
                  return res.status(400).json({ error: 'Insufficient stock' });
                }
                
              } 
           
              // Assuming you have a function to create an order in your Order model
              const order = new Order({
                  userId: new mongoose.Types.ObjectId(req.session.userId),
                  address: selectedAddress,
                  payment: req.body.paymentMethod || 'cod',
                  // product: selectedProducts,
                  products: user.cart.map((item) => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    pricePerQnt: item.product.salePrice,
                  })),
                  totalPrice,
                  status:'pending',     
              });
              
              // Save the order to the database
             await order.save();

              // Update stock for each product
        for (const item of user.cart) {
          const product = selectedProducts.find(
            (p) => p._id.toString() === item.productId
          );

          if (product) {
            product.units -= item.quantity;
            await product.save();
          }
        }

              // Clear the user's cart after the purchase
              user.cart = [];
              await user.save();
              res.status(200).json({success:true})     
          } else {
              res.redirect('/login');
          }
      
  } catch (error) {
      console.error('Error in buy controller:', error);
      res.status(500).json({ error: 'An error occurred' });
  }
};



//razorpay(coupon changes)

exports.createRazorpayOrder = async (req, res) => {
  try {
    
    const userId = req.session.userId;
    const { selectedAdd,discountTotal,couponCode } = req.body;
    console.log(couponCode,"--------------------------");
    console.log(discountTotal);
    if(couponCode!==null){
      const coupons = await Coupon.findOne({code:couponCode})
      coupons.user.push(userId)
      await coupons.save()
      console.log(coupons);

    }

    const user = await User.findById(userId).populate('addresses');
      
      const selectedAddress = user.addresses.find(address => address._id.toString() === selectedAdd);
      const productIds = user.cart.map(item => item.productId);
      const selectedProducts = await Product.find({ _id: { $in: productIds } });
      let totalPrice
      if(totalPrice==discountTotal){

      
       totalPrice = user.cart.reduce((total, item) => {
        if (item.product && item.product.salePrice) {
          return total + item.product.salePrice * item.quantity;
        }
        return total;
      }, 0);
    }else{
      totalPrice=discountTotal
    }
    console.log(totalPrice);

      // Create Razorpay order using the initialized instance
      const orderOptions = {
        amount: Math.round(totalPrice * 100), // Razorpay accepts amount in paisa
        currency: 'INR',
        receipt: `order_${Date.now()}`, // Use a timestamp as a receipt
        payment_capture: 1,
      };

       await razorpay.orders.create(orderOptions,(err,data)=>{
        if (err) {
          console.error('Error creating Razorpay order:', err);
          res.status(500).json({ error: 'Error creating Razorpay order' });
        } else {
          console.log('order created', data);
          res.status(201).json({
            success: true,
            order: data,
          });
        }

      });
    
   
  } catch (error) {
    console.error('Error in createRazorpayOrder controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


exports.createOrder= async(req,res)=>{
  try{
    console.log('----------[[[[[[[[[[[[[[[[[[[[[[[[[[[[[');
    const userId = req.session.userId;
    const { selectedAdd,totalPrice } = req.body;
    console.log(totalPrice);
    console.log(typeof(totalPrice));
    console.log(req.body,'0000000000000000000000000000000');
    console.log(selectedAdd,'-==================');
    const user = await User.findById(userId).populate('addresses');
    console.log(user.cart);
    if (user && !user.blocked) {
      const selectedAddress = user.addresses.find(address => address._id.toString() === selectedAdd);
      const productIds = user.cart.map(item => item.productId);
      const selectedProducts = await Product.find({ _id: { $in: productIds } });
     console.log(selectedProducts);
      // const totalPrice = user.cart.reduce((total, item) => {
      //   if (item.product && item.product.salePrice) {
      //     return total + item.product.salePrice * item.quantity;
      //   }
      //   return total;
      // }, 0);
      // console.log(totalPrice);

      const order = new Order({
        userId: new mongoose.Types.ObjectId(req.session.userId),
        address: selectedAddress,
        payment: 'razorpay', // Assuming 'razorpay' for Razorpay orders
        products: user.cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          pricePerQnt: item.salePrice,
        })),
        totalPrice,
        status: 'pending',
      });
  
      // Save the order to the database
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

      // Clear the user's cart after the purchase
      user.cart = [];
      await user.save();
      res.json({ success: true, order: order });
    }
  }
  catch(error){
    console.error('Error in createRazorpayOrder controller:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}