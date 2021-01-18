'use strict';

module.exports = function(Devicecommands) {


    Devicecommands.observe('access', function (ctx, next) {
        next();
    });

    Devicecommands.observe('loaded', function (ctx, next) {
        next();
    });


    Devicecommands.observe('persist', function (ctx, next) {
        next();
    });
    
    Devicecommands.observe('*', function(ctx, next) {
        console.log(ctx.methodString, 'was invoked remotely');     
        next();
    });

    Devicecommands.beforeRemote('*', function (ctx, user, next) {
        console.log(ctx.methodString, 'was invoked remotely'); 
        next();
    });

    Devicecommands.afterRemote('*', function(ctx, remoteMethodOutput, next) {
        console.log(ctx.methodString, 'was invoked remotely'); 
        next();
    });

    Devicecommands.listDeviceCommands = function(mac_id, cb) {
        Devicecommands.find({where:{mac_id: mac_id}}, cb);
    };
     
    Devicecommands.remoteMethod('listDeviceCommands',{
            accepts: [{arg: 'mac_id', type: 'String'}],
            returns: {arg: 'devices', type: 'array'},
            http: {path:'/listDeviceCommands', verb: 'get'}
        }
    );

    Devicecommands.getDeviceCommandsByTime = function(mac_id, start_time, end_time, cb){    
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);

        if(startTime && endTime){
            const payload = {
                where: {
                    mac_id: mac_id,
                    system_time: {
                        between:[new Date(startTime), new Date(endTime)]
                    }
                }
            };
            Devicecommands.find(payload, function(err, array) {
                if(err) return cb(null, err);
                return cb(null, array);
            });
        }
    };
    
    Devicecommands.remoteMethod('getDeviceCommandsByTime',{
            accepts: [
                {arg: 'mac_id', type: 'String'},
                {arg: 'start_time', type: 'String'},
                {arg: 'end_time', type: 'String'}
            ],
            returns: {arg: 'data', type: 'String'},
            http: {path:'/getDeviceCommandsByTime', verb: 'post'}
        }
    );
};
