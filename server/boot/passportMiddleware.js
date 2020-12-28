const passport = require('passport');

module.exports = (app) => {
  passport.initialize();
  require('../../services/passport');
}