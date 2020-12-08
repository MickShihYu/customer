'use strict';

const querystring = require('querystring');
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken');

module.exports = function(app) {
  var User = app.models.user;

  app.get('/', function(req, res) {
    res.render('login', {
      username: "",
      email: "",
      password: ""
    });
  });

  app.post('/setup', function(req, res) {
    User.create({ 
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    }, function(err, token) {
      if (err) {
        res.render('response', {
          title: 'Create failed...',
          content: err,
          redirectTo: '/',
          redirectToLinkText: 'Please recreate',
        });
        return;
      }

      token = token.toJSON();
      
      res.render('home', {
        username: req.body.username,
        email: req.body.email,
        accessToken: token.id,
        redirectUrl: '/api/users/change-password?access_token=' + token.id
      });
    });
  });

  app.post('/login', function(req, res) {
    User.login({
      username: req.body.username,
      password: req.body.password
    }, 'user', function(err, token) {
      if (err) {
        if(err.details && err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED'){
          res.render('reponseToTriggerEmail', {
            title: 'Login failed',
            content: err,
            redirectToEmail: '/api/users/'+ err.details.userId + '/verify',
            redirectTo: '/',
            redirectToLinkText: 'Click here',
            userId: err.details.userId
          });
        } else {
          res.render('response', {
            title: 'Login failed. Wrong username or password',
            content: err,
            redirectTo: '/',
            redirectToLinkText: 'Please login again',
          });
        }
        return;
      }

      // var payload = {
      //   id:token.id
      // };
      // var tokenID = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, process.env.JWT_SECRET_KEY);

      // res.render('home', {
      //   username: req.body.username,
      //   accessToken: tokenID,
      //   token:tokenID,   
      //   redirectUrl: '/api/users/change-password?access_token=' + tokenID
      // });

      res.render('home', {
        username: req.body.username,
        accessToken: token.id, 
        redirectUrl: '/api/users/change-password?access_token=' + token.id
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
    User.resetPassword({
      email: req.body.email
    }, function(err) {
      if (err) return res.status(401).send(err);

      res.render('response', {
        title: 'Password reset requested',
        content: 'Check your email for further instructions',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });

  app.get('/reset-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    res.render('password-reset', {
      redirectUrl: '/api/users/reset-password?access_token='+
        req.accessToken.id
    });
  });
};
