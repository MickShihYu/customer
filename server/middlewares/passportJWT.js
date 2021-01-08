// Define your passport JWT middleware here then export it
// we tell passport to use passport-jwt
const passport = require('passport');

module.exports = (req, res, next) => {
  // we are not using session
  // Step 1: we need to whitelist some APIs
  // /Customers/login, 
  // /explorer API explorer
  const whiteList = [
    '/explorer',
    '/customers/login',
  ];

  // Request to /Customers/login => apiWhiteListed = true
  // Request to /Devices => apiWhiteListed = false
  const apiWhiteListed = whiteList.some(api => req.path.match(api));
  // if req.path matched the whiteList APIs then we don't apply passport JWT
  if (apiWhiteListed) {
    next();
    return;
  }


  // Request to /Devices have to pass the passport jwt authentication
  // otherwise, all the requests must be authenticated
  // - we defined the logic of Passport JWT in services/passport
  // - In this middleware, we only need to tell passport 
  //   to authenticate requests using passport jwt
  passport.authenticate('jwt', // correct!
    { session: false }
  )(req, res, next);

}
