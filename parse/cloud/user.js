// Provides endpoints for user signup and login

module.exports = function(){
  var express = require('express');
  var app = express();

  //Login 
  app.get('/login', function(req, res) {
    // Renders the login form asking for username and password.
    if(Parse.User.current()){
      res.redirect('/');
    } else {
      res.render('login.ejs');
    }
  });

  app.post('/login', function(req, res) {
    Parse.User.logIn(req.body.username, req.body.password).then(function(user) {      
      res.redirect('/');
    },
    function(error) {
      // Login failed, redirect back to login form.
      res.redirect('/login');
    });
  });

  //sign up 
  //TODO need modify input mechanism and check user name used
  app.post('/signup', function(req, res){
    Parse.User.signUp(req.body.sign_name, req.body.sign_pwd).then(function() {
      res.redirect('/login');
    },
    function(error){
      res.redirect('/login');
    });
  });

  // Log out
  app.get('/logout', function(req, res) {
    Parse.User.logOut();
    res.redirect('/login');
  });



  app.get('/profile', function(req, res) {
  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      Parse.User.current().fetch().then(function(user) {
        var userInfo = Parse.User.current();
        var name = userInfo.get("fullName");        
        var email = userInfo.get("email");
        var group = userInfo.get("group");
        var position = userInfo.get("jobPosition");    
        res.render('profile', { name:name, email:email, group:group, position:position })
      },
      function(error) {
      // Render error page.
      });
    } else {
      // User not logged in, redirect to login form.
      res.redirect('/login');
    }
  });
  return app;
}();
