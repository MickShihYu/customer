'use strict';

const { convert2nimn } = require('fast-xml-parser');
const MongoDB = require('../../db');

module.exports = function(Device) {

    Device.insert = function(data, cb){
        Device.find({where:{mac_id:data.mac_id}}, function(err, device){
            if(err) return cb(null, err);
            
            data.system_time==null?new Date():data.system_time;

            if(device.length>0){
                cb(new Error('Device mac_id is exit!'));   
            }else{ 
                Device.create({
                    mac_id: data.mac_id,
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

    Device.getConfigurationData = function(data, cb){

        Device.find({where:{mac_id:data.mac_id}}, function(err, device){
            if(err) return cb(null, err);
            if(device.length>0){
                MongoDB.getDataByKey("device", "cfg", device[0].mac_id+"_cfg", (err, data)=>{
                    if(err) cb(err);
                    cb(null, data);
                });
            }else{
                cb(new Error('Device mac_id is not exit!'));   
            }
        });
    };

    Device.remoteMethod(
        'getConfigurationData',
        {
          accepts: [{arg: 'value', type: 'Object'}],
          returns: {arg: 'value', type: 'String'},
          http: {path:'/getConfigurationData', verb: 'post'}
        }
    );

    Device.getDataByDate = function(data, cb){
        if(data==null) cb(new Error("data is empty!"));
        if(data.company==null || data.mac_id==null || data.start_time==null || data.end_time==null) cb(new Error("data parameter is empty!"));

        MongoDB.getDataByDate(data.company, data.mac_id + "_info", data.start_time, data.end_time, cb, (err, data)=>{
            if(err) cb(err);
            cb(null, data)
        });
    };

    Device.remoteMethod(
        'getDataByDate',
        {
          accepts: [{arg: 'value', type: 'Object'}],
          returns: {arg: 'value', type: 'String'},
          http: {path:'/getDataByDate', verb: 'post'}
        }
    );
};