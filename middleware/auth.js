const User = require('../models/user');


exports.isLogged = (req, res, next) => {
  if (req.session.user) {
    User.findById({ _id: req.session.user })
      .lean()
      .then((data) => {
        // You can remove this part if you don't need the verification check.
        // if (data.isVerified === 0) {
        //   next();
        // } else {
        //   res.redirect('/logout');
        // }
        next(); 
      });
  } else {
    res.redirect('/login');
  }
};

exports.adminLoggedIn = (req, res, next) => {
    if (req.session.adminLoggedIn == true) {
      next();
    } else {
      res.render('admin/login',{ title: 'Admin dashboard', errorMessage: '' });
    }
  };