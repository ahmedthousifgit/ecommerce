const User = require('../models/user')
const Product= require('../models/products-model')


exports.showCart = async(req,res)=>{
    try{
       const userId = req.session.userId
       const user = await User.findById(userId).populate('cart.productId')
       const totalAmount = user.cart.reduce((total, item) => {
        return total + item.product.salePrice * item.quantity;
    }, 0);

       res.render('user/cart',{cart : user.cart, username:user.name ,totalAmount })  
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

// exports.updateQuantity= async(req,res)=>{
//     try{
//      const {productId,action}=req.body
//      const userId = req.session.userId

//      const user = await User.findOneAndUpdate(
//         { _id: userId, 'cart.productId': productId },
//         {
//           $inc: { 'cart.$.quantity': action === 'increment' ? 1 : -1 },
//         },
//         { new: true }
//       );
//       res.json({cart:user.cart })
//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({ error: "An error occurred" });
//         }
// }


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

          res.json({ cart: updatedUser.cart });
      } else {
          res.status(404).json({ message: 'Item not found in the cart' });
      }
  } catch (error) {
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