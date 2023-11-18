const User = require('../models/user')
const Product= require('../models/products-model')
const Order = require('../models/order-model')


exports.showCart = async(req,res)=>{
    try{
       const userId = req.session.userId
       const user = await User.findById(userId).populate('cart.productId')
        
       const totalPrice = user.cart.reduce((total, item) => {
        // Check if item.product is not null before accessing properties
        if (item.product && item.product.salePrice) {
            return total + item.product.salePrice * item.quantity;
        }
        return total;
    }, 0);
   
    const totalAmount = totalPrice;
    


       res.render('user/cart',{cart : user.cart, username:user.name ,totalPrice,totalAmount })  
    }
    catch(error){
        console.log(error);
    res.status(500).json({ error: "An error occurred" });
    }
    
}


exports.addToCart = async(req,res)=>{
    try{
        const {productId} = req.body  //hidden productId in productdetails
        const userId = req.session.userId

        const existingCartItem = await User.findOne({
          _id: userId,
          'cart.productId': productId
      });
      if (existingCartItem) {
        // If the product is already in the cart, update the quantity
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, 'cart.productId': productId },
            { $inc: { 'cart.$.quantity': 1 } },
            { new: true }
        );
        res.redirect('/cart'); 
    } else {
        // If the product is not in the cart, add it as a new item
        const product = await Product.findById(productId);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $push: { cart: { productId, quantity: 1, product } } },
            { new: true }
        );
        res.redirect('/cart');
    }
    }
    catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
    }
}


exports.updateQuantity = async (req, res) => {
  try {
      const { productId, action } = req.body;
      const userId = req.session.userId;

      const user = await User.findOne({ _id: userId, 'cart.productId': productId });

      if (user) {
          const currentQuantity = user.cart.find(item => item.productId === productId).quantity;

          // Update the quantity based on the action (increment or decrement)
          let newQuantity;
          if (action === 'increment') {
              newQuantity = currentQuantity + 1;
          } else if (action === 'decrement') {
              newQuantity = currentQuantity - 1;
          }

          // Ensure the new quantity is between 0 and 15
          newQuantity = Math.min(15, Math.max(0, newQuantity));

          // Update the quantity in the cart
          const updatedUser = await User.findOneAndUpdate(
              { _id: userId, 'cart.productId': productId },
              { $set: { 'cart.$.quantity': newQuantity } },
              { new: true }
          );
          const totalAmount = updatedUser.cart.reduce((total, item) => total + (item.product.salePrice * item.quantity), 0);
          res.json({ cart: updatedUser.cart,totalAmount });
      } else {
          res.status(404).json({ message: 'Item not found in the cart' });
      }
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
  }
}

exports.cartCount= async(req,res)=>{
    try{
     const userId = req.session.userId
     const user = await User.findById(userId)
     if(user && user.cart){
        const cartCount = user.cart.reduce((count,item)=>{
            return count+item.quantity
           
        },0)
        res.json({cartCount})
     }else{
        res.json({cartCount:0})
     }
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });    
    }
}



exports.removeFromCart= async(req,res)=>{
    try{
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
          res.json({ message: 'Item removed from the cart successfully' });
        } else {
          res.status(404).json({ message: 'Item not found in the cart' });
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}





exports.buyNow = async (req, res) => {
    try {
        if (req.session.userId) {
            const userId = req.session.userId;
            const user = await User.findById(userId).populate('addresses');

            if (user && !user.blocked) {
                // Check if the user has items in the cart
                if (!user.cart || user.cart.length === 0) {
                    return res.redirect('/cart'); // Redirect to the cart page if the cart is empty
                }

                // Calculate total price
                let totalPrice = 0;
                for (const item of user.cart) {
                    const product = await Product.findById(item.productId);
                    if (!product) {
                        // Handle the case where a product in the cart is not found
                        console.error(`Product with ID ${item.productId} not found`);
                        continue;
                    }

                    if (item.quantity > product.units) {
                        req.session.unitErr = true;
                        return res.redirect('/cart');
                    }
                    req.session.unitErr = false;

                    totalPrice += item.quantity * product.salePrice;
                }
                const selectedAddressId = req.body.address;
                const selectedAddress =  user.addresses.find(address=>address._id.toString()===selectedAddressId)
                const productIds = user.cart.map(item => item.productId);
                const selectedProducts = await Product.find({ _id: { $in: productIds } });
  
                const newOrder = new Order({
                    totalPrice,
                    address: selectedAddress,
                    product:selectedProducts,
                    userId,
                    paymentMethod:req.body.paymentMethod || 'cod'
                    
                })

                const saveOrder = await newOrder.save()
                user.cart=[];
                await user.save()

                res.render('user/buy-now', {
                    user, 
                    username: user.name,
                    cart: user.cart,
                    totalPrice,
                    paymentMethod : req.body.paymentMethod || 'cod',
                    order :saveOrder,
                    showOrderConfirmation: true
                });
            } else {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error in buyNow controller:', error);
        res.status(500).json({ error: "An error occurred" });
    }
};


exports.buy = async (req, res) => {
    try {
        if (req.session.userId) {
            const userId = req.session.userId;
            const user = await User.findById(userId).populate('addresses');

            if (user && !user.blocked) {
                // Assuming orderId is passed in the query parameter
                const orderId = req.query.orderId;

                if (!orderId) {
                    // If orderId is not provided, redirect to an appropriate page or handle the error
                    return res.redirect('/'); // Update the redirect URL as needed
                }

                // Retrieve order details from the database
                const order = await Order.findById(orderId);

                if (!order || order.userId.toString() !== userId) {
                    // If the order is not found or does not belong to the current user, handle the error
                    return res.redirect('/'); // Update the redirect URL as needed
                }

                // Render the order confirmation page with order details
                res.render('user/order-details', { user, order });
            } else {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error in buy controller:', error);
        res.status(500).json({ error: "An error occurred" });
    }
};
