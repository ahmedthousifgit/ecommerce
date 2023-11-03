const adminModel = require('../models/admin')
const bcrypt = require('bcrypt')

exports.authenticateAdmin = async (req, res, next) => {
   const {username,password} = req.body
   try{
     const admin =  await adminModel.findOne({username})
     if(admin && admin.isAdmin == true){
      const passwordMatch = await bcrypt.compare(password,admin.password)
      if(passwordMatch){
        req.session.adminId = admin._id;
        res.redirect('/admin/dashboard')
      }else{
        return res.status(401).render('admin/login', {
          title: 'Admin Login',
          errorMessage: 'Invalid username or password. Please try again.',
        });
       
      }
     }
   }catch (error) {
    console.error('Error in authenticateAdmin:', error);
    return res.status(500).render('admin/login', {
      title: 'Admin Login',
      errorMessage: 'An error occurred. Please try again later.',
    });
  }
}


exports.adminCategory = async(req,res,next)=>{
  
}