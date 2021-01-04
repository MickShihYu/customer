const passport = require('passport');
// import passport JWT middleware
const passportJWT = require('../middlewares/passportJWT');

module.exports = (app) => {
  passport.initialize(); // Initialize Passport
  require('../../services/passport'); // Passport service logic definitions

  app.use(passportJWT);
  // tell Express app to use Passport JWT middleware
}