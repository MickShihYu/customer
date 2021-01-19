'use strict';
const bcrypt = require('bcrypt');
const passportLocal = require('../../server/middlewares/passportLocal');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

module.exports = function (Customer) {
    // customer username should be uniqe
    Customer.validatesUniquenessOf('username');

    const whiteList = [
        'create',
        'find',
        'findOne',
        'login'
    ];

    Customer.sharedClass.methods().forEach((method) => {
        const name = method.isStatic ? method.name : `prototype.${method.name}`;
        if (whiteList.indexOf(name) === -1) Customer.disableRemoteMethodByName(name);
    });

    Customer.observe('access', function (ctx, next) {
        next();
    });

    Customer.observe('loaded', function (ctx, next) {
        const { instance, data } = ctx;
        next();
    });

    Customer.observe('persist', function (ctx, next) {
        next();
    });

    Customer.observe('*', function (ctx, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });


    Customer.beforeRemote('*', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });


    Customer.afterRemote('*', function (ctx, remoteMethodOutput, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });

    Customer.observe('before save', async (context) => {
        // every time customer get a update or insert request
        // check for password and hash it
        const { instance, data } = context;
        if (instance && instance.password) {
            // create new instance of customer
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(instance.password, salt);
            // replace plain password with hashed one
            instance.password = hashed;
        }

        if (data && data.password) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(data.password, salt);
            // replace plain password with hashed one
            data.password = hashed;
        }
    });

    Customer.beforeRemote('login', passportLocal);

    Customer.login = function (req, callback) {
        const { customer } = req;
        if (customer) {
            // generate JWT Token for client here
            const TWO_WEEKS_IN_MILLISECONDS = 2 * 7 * 24 * 3600 * 1000;
            const access_token = jwt.sign(
                { sub: customer.id }, // This is the payload
                process.env.JWT_PRIVATE_KEY,
                { expiresIn: TWO_WEEKS_IN_MILLISECONDS }
            );
            callback(null, {
                access_token
            });
        }
        else {
            callback(null);
        }
    };

    Customer.remoteMethod('login', {
        accepts: [{ arg: 'req', type: 'object', http: { source: 'req'} }],
        returns: { arg: 'response', type: 'object', root: true },
        http: { path: '/login', verb: 'post' }
    });

    Customer.afterRemoteError('**', ({ res, error }) => {
        res.status(error.statusCode || 400)
            .send({ message: error.message });
    });
};
