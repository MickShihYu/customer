'use strict';
module.exports = async function (Device) {
    const whiteList = [
        'create',
        'find',
        'findOne',
        'login'
    ];

    Device.sharedClass.methods().forEach((method) => {
        const name = method.isStatic ? method.name : `prototype.${method.name}`;
        if (whiteList.indexOf(name) === -1) Device.disableRemoteMethodByName(name);
    })

    Device.observe('access', function logQuery(ctx, next) {
        console.log('Accessing %s matching %s', ctx.Model.modelName, ctx.query.where);
        next();
    });

    Device.observe('*', function (ctx, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });

    Device.beforeRemote('**', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });

    Device.beforeRemote('find', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });

    Device.afterRemote('find', function (ctx, remoteMethodOutput, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });

    Device.beforeRemote('findone', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });

    Device.beforeRemote('*.__get__device_cfg', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });


    Device.getStatus = function (id, cb) {
        Device.find({where:{mac_id: id}}, function(err, array) {
            if(err) return cb(err);
            let status = array[0].values.status;
            status = status==null?'offline':status;
            return cb(null, status);
        });
    };

    Device.remoteMethod('getStatus', {
        accepts: [{ arg: 'id', type: 'String' }],
        returns: { arg: 'status', type: 'Object' },
        http: { path: '/getStatus', verb: 'get' }
    });
};
