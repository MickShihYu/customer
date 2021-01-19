const loopback = require('loopback');
const bcrypt = require('bcrypt');
const passport = require('passport');
const createError = require('http-errors');
const Joi = require("@hapi/joi");
const { Strategy: LocalStrategy } = require('passport-local');

// Require Passport JWT
const {
  ExtractJwt,
  Strategy: JWTStrategy
} = require('passport-jwt');

function validateLoginForm(form) {
  const schema = {
    username: Joi.string()
      .max(255)
      .required(),
    password: Joi.string()
      .max(255)
      .required()
  }
  return Joi.validate(form, schema);
}

// Create local strategy for /api/Customers/login
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  // we need to validate username and password
  // using joi libary
  // npm install joi
  try {
    const { error } = validateLoginForm({ username, password });

    if (error) throw error;

    // Search user by username
    const Customer = loopback.getModel('customer');
    const customer = await Customer.findOne({
      where: { username }
    });

    //console.log(JSON.stringify(customer, null, 2));

    // if customer is NOT found
    // npm install http-errors
    if (!customer) throw createError(400, 'Invalid username or password.');

    // username existed - we check password
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) throw createError(400, 'Invalid username or password.');

    // username and password is correct
    done(null, customer);
    
  } catch (error) {
    done(error);
  }
}));

// Define your passport JWT logic here
passport.use(
  new JWTStrategy(
    {
      // Strategy options
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField('access_token'),
        ExtractJwt.fromUrlQueryParameter('access_token'),
        ExtractJwt.fromHeader('access_token')
      ]),
      secretOrKey: process.env.JWT_PRIVATE_KEY
    },
    async (payload, done) => {
      // YOUR CODE HERE
      // server received a request with token
      // - Step 1: Decode the JWT => Done by passport JWT => return payload
      // - Step 2: Search customer based on customer Id (inside payload)
      // - Step 3: I know you are logged in user Mick, you are allowed to access the Device resources
      try {
        const Customer = loopback.getModel('customer');
        // - Look at the payload when you sign the JWT
        // jwt.sign(payload, private_key, options)
        // - You can use Customer.findById(id) instead
        const customer = await Customer.findById(payload.sub);

        // done unthorized request
        if (!customer) throw createError(401, 'Unauthorized Request.');

        done(null, customer);
      } catch (error) {
        done(error)
      }
    }
  )
);

