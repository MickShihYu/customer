'use strict';
const { convert2nimn } = require('fast-xml-parser');
const db = require('../../server/db');

module.exports = async function(Device) {

    const MongoDB = await db(process.env.DEVICE_DB_NAME, 'localhost', process.env.MONGO_PORT);
    //var User = app.models.user;

    Device.listDevices = function(id, cb) {
        Device.find({where:{ownerId: id}}, cb);
    };
     
    Device.remoteMethod('listDevices',{
            accepts: [{arg: 'id', type: 'String'}],
            returns: {arg: 'devices', type: 'array'},
            http: {path:'/list-devices', verb: 'get'}
        }
    );

    Device.insert = function(data, cb){
        Device.find({where:{mac_id:data.mac_id}}, function(err, device){
            if(err) return cb(null, err);
            
            data.system_time==null?new Date():data.system_time;

            if(device.length>0){
                cb(new Error('Device mac_id is exit!'));   
            }else{ 
                Device.create({
                    mac_id: data.mac_id,
                    company: data.company,
                    ownerId: data.ownerId,
                    system_time:data.system_time
                },function(err, device){
                    if(err) return cb(err);
                    console.log(device)
                });
            }
        });
    };

    Device.remoteMethod(
        'insert',
        {
          accepts: [{arg: 'value', type: 'Object'}],
          returns: {arg: 'value', type: 'String'},
          http: {path:'/insert', verb: 'post'}
        }
    );

    Device.getConfigurationData = function(id, cb){
        Device.findById(id, function(err, device){
            if(err) return cb(err, null);
            MongoDB.getDataByKey("device", "cfg", device.mac_id+"_cfg", (err, data)=>{
                if(err) return cb(err);
                cb(null, data);
            });
        });
    };

    Device.remoteMethod('getConfigurationData',{
            accepts: [
                {arg: 'id', type: 'String'}
            ],
            returns: {arg: 'value', type: 'String'},
            http: {path:'/getConfigurationData', verb: 'post'}
        }
    );

    Device.getDataByDate = function(id, start_time, end_time, cb){
        Device.findById(id, function(err, device){
            if(err) return cb(err, null);
            MongoDB.getDataByDate(device.company, device.mac_id + "_info", start_time, end_time, (err, data)=>{
                if(err) return cb(err);
                cb(null, data)
            });
        });
    };

    Device.remoteMethod('getDataByDate',{
            accepts: [
                {arg: 'id', type: 'String'},
                {arg: 'start_time', type: 'String'},
                {arg: 'end_time', type: 'String'}
            ],
            returns: {arg: 'deviceData', type: 'array'},
            http: {path:'/getDataByDate', verb: 'post'}
        }
    );
};
