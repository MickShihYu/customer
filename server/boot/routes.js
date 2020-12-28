'use strict';

const querystring = require('querystring');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

module.exports = function(app) {
  var Customer = app.models.customer;

  passport.use(new LocalStrategy(
    function(username, password, done) {
      Customer.findOne({username:username}, function(err, customer) {
        if (err) { return done(err); }
        if (!customer) 
          return done(null, false, { message: 'user is exit.' });
        
        if (!bcrypt.compareSync(password, customer.password)) 
          return done(null, false, { message: 'password is fail.' });
        
        return done(null, customer);
      });
    }

  ));
  
  passport.use(new JWTStrategy({
    //jwtFromRequest: ExtractJwt.fromAuthHeader(),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'token_test'
  },
  function (jwtPayload, cb) {
      return Customer.findOneById(jwtPayload.id)
          .then(customer => {
              return cb(null, customer);
          })
          .catch(err => {
              return cb(err);
          });
  }));

  passport.serializeUser(function(customer, done) {
    done(null, customer.id);
  });
  
  passport.deserializeUser(function(name, done) {
    Customer.findOne({name:name}, function(err, customer) {
      done(err, customer);
    });
  });
  
  app.get('/', checkAuthenticated, (req, res) => {
    //res.render('index.ejs', { name: req.user.name })
    const customer = req.customer;
    return res.render('home', {
      username: customer.username,
      accessToken: customer.id, 
      redirectUrl: '/api/users/change-password?access_token=' + customer.id
    });
  });

  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  });

  app.post('/signin', function(req, res, next) {
    passport.authenticate('local', function(err, customer, info) {
      if (err) { return next(err); }

      if (!customer) {  
        return res.render('response', {
          title: 'Login failed. Wrong username or password',
          content: err,
          redirectTo: '/',
          redirectToLinkText: 'Please login again',
        });
      }

      res.cookie('jwt', customer.token, { httpOnly: true, secure: true });
      
      //return res.json({success: true, token: customer.token});

      return res.render('home', {
        username: customer.username,
        access_token: customer.token,
        redirectUrl: '/api/users/change-password?access_token=' + customer.token
      });

    })(req, res, next);
  });

  app.post('/setup', function(req, res) {

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    Customer.createUser(username, email, password, function(err, customer) {
      if (err || !customer) {
        res.render('response', {
          title: 'Create failed...',
          content: err,
          redirectTo: '/',
          redirectToLinkText: 'Please recreate',
        });
        return;
      }

      res.cookie('jwt', customer.token, { httpOnly: true, secure: true });
      
      //return res.json({ success: true, token: customer.token });
      

      res.render('home', {
        username: customer.username,
        email: customer.email,
        accessToken: customer.token,
        redirectUrl: '/api/users/change-password?access_token=' + customer.token
      });
    });
  });

  app.get('/logout', function(req, res, next) {
    const url = req.url.split("?")[1];
    var query = querystring.parse(url);
    const token = query.access_token;

    if (!token){
      res.redirect('/');
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decode) => {
      if (err) {
        res.redirect('/');
      } else {
        User.logout(decode.payload.id, function(err) {
            if (err) return next(err);
            res.redirect('/');
        });
      }
    });
  });

  app.post('/request-password-reset', function(req, res, next) {
    // Customer.resetPassword({
    //   email: req.body.email
    // }, function(err) {
    //   if (err) return res.status(401).send(err);

    //   res.render('response', {
    //     title: 'Password reset requested',
    //     content: 'Check your email for further instructions',
    //     redirectTo: '/',
    //     redirectToLinkText: 'Log in'
    //   });
    // });
  });

  app.get('/reset-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    // res.render('password-reset', {
    //   redirectUrl: '/api/users/reset-password?access_token='+
    //     req.accessToken.id
    // });
  });

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
};
