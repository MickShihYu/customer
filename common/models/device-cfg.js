'use strict';

module.exports = function(Devicecfg) {
    Devicecfg.listDevices = function(id, cb) {
        Device.find({where:{ownerId: id}}, cb);
    };
     
    Devicecfg.remoteMethod('listDevices',{
            accepts: [{arg: 'id', type: 'String'}],
            returns: {arg: 'devices', type: 'array'},
            http: {path:'/list-devices', verb: 'get'}
        }
    );
};
