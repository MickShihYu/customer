const loopback = require('loopback');
const bcrypt = require('bcrypt');
const passport = require('passport');
const createError = require('http-errors');
const Joi = require('joi');
const {Strategy: LocalStrategy} = require('passport-local');

function validateLoginForm(form) {
  const schema =Joi.object({
    username: Joi.string()
      .max(255)
      .required(),
    password: Joi.string()
      .max(255)
      .required()
  })

  return schema.validate(form);
  //return Joi.valid(form, schema);
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
    
    const {error} = validateLoginForm({username, password})
    if (error) throw error;

    // Search user by username
    const Customer = loopback.getModel('customer');
    const customer = await Customer.findOne({
      where: { username }
    });

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