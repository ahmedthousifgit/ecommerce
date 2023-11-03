var express = require('express');
var router = express.Router();
const adminController = require('../controller/adminController');

//admin login
router.get('/', (req, res) => {
  if(req.session.adminId){
    res.redirect('/admin/dashboard')
  }else{
    res.render('admin/login', { title: 'Admin dashboard', errorMessage: '' });
   }

});
router.post('/login',adminController.authenticateAdmin)

//dashboard
router.get('/dashboard', (req, res) => {
  if(req.session.adminId){
    res.render('admin/dashboard', { title: 'Admin dashboard', errorMessage: '' });
    
  }else{
    res.redirect('/admin')
  }

});

//category
router.get('/category',(req,res)=>{
  if(req.session.adminId){
    res.render('admin/category',{title: 'Category management', errorMessage: ''})
  }else{
    res.redirect('/admin')
  }
})


//logout
router.get('/logout',(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
    }
    res.redirect('/admin')
  })
})

module.exports = router;
