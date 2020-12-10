
require('dotenv').config({});
'use strict';
const loopback = require('loopback');
const boot = require('loopback-boot');
const app = module.exports = loopback();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const loopbackPassport = require('loopback-component-passport');
const PassportConfigurator = loopbackPassport.PassportConfigurator;
const passportConfigurator = new PassportConfigurator(app);
const bodyParser = require('body-parser');
const flash      = require('express-flash');

let config = {};

try {
  config = require('../providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1);
}

const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

boot(app, __dirname);

app.middleware('parse', bodyParser.json());
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));

app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }) );
app.use(flash());

passportConfigurator.init();
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});

for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

if (require.main === module) {
  app.start();

}
