'use strict';
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY || null;
module.exports = async function(User) {

  // User.prototype.createAccessToken = function(ttl, cb) {
  //   const userSettings = this.constructor.settings;
  //   const expiresIn = Math.min(ttl || userSettings.ttl, userSettings.maxTTL);
  //   const accessToken = jwt.sign({id: this.id}, secretKey, {expiresIn});
  //   const payload = Object.assign(this, {id:accessToken});
  //   return cb ? cb(null, payload) : {id: accessToken};
  // };

  User.afterRemote('create', function(context, userInstance, next) {
    console.log('> user.afterRemote triggered');

    var verifyOptions = {
      type: 'email',
      to: userInstance.email,
      from: 'mick.shih.yu.test@gmail.com',
      subject: 'Thanks for registering.',
      redirect: '/verified',
      user: userInstance
    };

    userInstance.verify(verifyOptions, function(err, response, next) {
      if (err) return next(err);

      console.log('> verification email sent:', response);

    });
  });

  User.afterRemote('prototype.verify', function(context, user, next) {
    context.res.render('response', {
      title: 'A Link to reverify your identity has been sent to your email successfully',
      content: 'Please check your email and click on the verification link before logging in',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  User.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' + info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: senderAddress,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

  User.afterRemote('changePassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password changed successfully',
      content: 'Please login again with new password',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  User.afterRemote('setPassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });
};
