// passport-config.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/admin'); // Your admin model file

passport.use(new LocalStrategy(
  function(username, password, done) {
    Admin.findOne({ username: username }, function(err, admin) {
      if (err) { return done(err); }
      if (!admin) { return done(null, false, { message: 'Incorrect username.' }); }
      if (admin.password !== password) { return done(null, false, { message: 'Incorrect password.' }); }
      return done(null, admin);
    });
  }
));

passport.serializeUser(function(admin, done) {
  done(null, admin.id);
});

passport.deserializeUser(function(id, done) {
  Admin.findById(id, function(err, admin) {
    done(err, admin);
  });
});
