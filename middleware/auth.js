const User = require('../models/user');


exports.isLogged = (req,res,next)=>{
  if(req.session.userId){
    next()
  }else{
    res.redirect('/login')
  }
}




