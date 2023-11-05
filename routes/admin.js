var express = require('express');
var router = express.Router();
const adminController = require('../controller/adminController');
const auth = require('../middleware/auth')


router.get('/',auth.adminLoggedIn,adminController.adminIndex);

router.get('/admin-login',adminController.adminLoggin)

router.post('/admin-login',adminController.authenticateAdmin)


//dashboard
router.get('/dashboard', (req, res) => {
  if(req.session.adminId){
    res.render('admin/dashboard', { title: 'Admin dashboard', errorMessage: '' });
    
  }else{
    res.redirect('/')
  }

});

//CATEGORY
router.get('/categories',adminController.adminCategoryForm)

router.post('/categoryForm',adminController.submitCategory)

router.get('/listCategories',adminController.listCategories)


router.get('/logout',adminController.logOut)

module.exports = router;
