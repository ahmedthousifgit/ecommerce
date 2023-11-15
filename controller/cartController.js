const User = require('../models/user')
const Product= require('../models/products-model')


exports.showCart = async(req,res)=>{
    try{
       const userId = req.session.userId
       const user = await User.findById(userId).populate('cart.productId')
       
       res.render('user/cart',{cart : user.cart, username:user.name  })  
    }
    catch(error){
        console.log(error);
    res.status(500).json({ error: "An error occurred" });
    }
    
}


exports.addToCart = async(req,res)=>{
    try{
        const {productId} = req.body  //hidden productId in productdetails
        const product = await Product.findById(productId)

        const userId = req.session.userId
        const user = await User.findByIdAndUpdate(userId,{$push:{cart:{productId,quantity:1,product}}},{new:true})
        res.redirect('/cart')
    }
    catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
    }
}

exports.updateQuantity= async(req,res)=>{
    try{
     const {productId,action}=req.body
     const userId = req.session.userId

     const user = await User.findOneAndUpdate(
        { _id: userId, 'cart.productId': productId },
        {
          $inc: { 'cart.$.quantity': action === 'increment' ? 1 : -1 },
        },
        { new: true }
      );
      res.json({cart:user.cart })
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