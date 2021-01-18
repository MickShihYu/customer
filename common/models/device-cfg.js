'use strict';

module.exports = function (Devicecfg) {


    Devicecfg.observe('access', function (ctx, next) {
        next();
    });

    Devicecfg.observe('loaded', function (ctx, next) {
        const { instance, data } = ctx;
        data.test = 'hello word';
        next();
    });


    Devicecfg.observe('persist', function (ctx, next) {
        next();
    });

    Devicecfg.observe('*', function (ctx, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });


    Devicecfg.beforeRemote('*', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });


    Devicecfg.afterRemote('*', function (ctx, remoteMethodOutput, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });


    Devicecfg.listDevices = function (id, cb) {
        cb(null);
    };

    Devicecfg.remoteMethod('listDevices', {
        accepts: [{ arg: 'id', type: 'String' }],
        returns: { arg: 'devices', type: 'array' },
        http: { path: '/list-devices', verb: 'get' }
    });
};
