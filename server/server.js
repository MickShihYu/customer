
require('dotenv').config({});

'use strict';
const loopback = require('loopback');
const app = module.exports = loopback();
const boot = require('loopback-boot');
const cookieParser = require('cookie-parser');
// const session = require('express-session');
const bodyParser = require('body-parser');
const flash      = require('express-flash');
// const passport = require('passport');
const path = require('path');
const logger = require('./logger');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.middleware('parse', bodyParser.json());
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

// app.middleware('auth', loopback.token({
//   model: app.models.accessToken,
// }));

// app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }) );
app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    logger.info('Web server listening at: %s', baseUrl);

    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      logger.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

boot(app, __dirname, function(err) {
  if (err) throw err;
  if (require.main === module)
    app.start();
});
