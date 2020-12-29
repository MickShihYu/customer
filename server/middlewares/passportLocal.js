// The LoopBack middleware is different from Express middelware
// 1. LoopBack Middleware (beforeRemote)
// function (context, model, next) {}

// 2. Express middleware
// function(request, response, next) {}
const passport = require('passport');

// create a LoopBack middleware using passport local authentication 
// for /api/Customers/login
module.exports = ({req, res}, model, next) => {
  // we are not using session
  passport.authenticate('local', 
  {
    session: false,
    userProperty: 'customer' // default value is "user"
  }, (err, customer) => {
    if (err) {
      res
        .status(400)
        .send({
          message: 'Invalid username or password.'
        });
      return;
    }
    
    req.customer = customer;

    next();
  })(req, res, next);
}