const { ETIMEDOUT } = require('constants');
const { MongoClient, ObjectID } = require('mongodb');
const async = require('async');

const connect = async function(name, host, port){
    const connectData = {
        serviceName: name,
        db_host:"mongodb://"+host+":"+port
    };

    connectData.init = async function(){
        console.log("------- db:" + this.serviceName + " init -------------");
        connectData.client = new MongoClient(this.db_host, { useUnifiedTopology: true });
        await connectData.start();
    }

    connectData.getName = function(){
        return this.serviceName;
    };

    connectData.start = async function(){
        if(this.client!=null)
        {
            this.client.connect();
            this.db = this.client.db(this.serviceName);
        }
    };

    connectData.isConnect = function(){
        return this.client.isConnected();
    }

    connectData.getComposeDataSetName = function(uuid, suid){
        let dataset = uuid;
        if(suid!=null && suid.length>0) dataset+="_"+suid;
        return dataset;
    };

    connectData.getCollectionNames = function(cb){
        const collections = [];
        this.db.listCollections().toArray((err, collInfos)=>{
            if(err) return cb(err);
            collInfos.forEach((doc) => { collections.push(doc.name) });
            cb(collections);
        });
    }; 

    connectData.getCollection = function(collectionName, cb){
        this.db.collection(collectionName, function(err,collection){
            if(err) return cb(err);
            cb(null, collection);
        });
    };

    connectData.deleteCollection = function(uuid, suid, cb){
        this.db.collection(this.getComposeDataSetName(uuid, suid)).drop( (err)=>{
            return cb(err);
        });
    };

    connectData.createCollection = function(uuid, suid, cb){
        this.getCollectionNames(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection)
            {
                this.db.createCollection(collectionName, (err)=>{
                    if (err) return cb(err);
                });
            }
        });
    };

    connectData.addData = function(uuid, suid, ukey, value, timestamp, cb)
    {
        this.getCollection(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection!=null)
            {
                const doc = value;
                doc._id = (ukey!=null&&ukey.length>0?ukey:new ObjectID());
                doc.uuid = uuid;
                doc.suid = suid;
                doc.ukey = ukey;
                doc.system_time = timestamp;
                
                this.insertData(doc, collection, cb);
            }
        });
    };

    connectData.insertData = function(doc, collection, cb)
    {
        //console.log("insert one: " + doc.uuid + "-" + doc.suid + "-" + doc.ukey);
        collection.insertOne(doc, (err)=>{
            if (err) {
                collection.updateOne({_id:doc.ukey},{"$set" : { "values" : doc.values}}, {upsert: true}, (err)=>{
                    if(err) return cb(err);
                    //console.log("update one: " + doc.uuid + "-" + doc.suid + "-" + doc.ukey);
                });
            } 
        });
    };

    connectData.updateData = function(doc, collection, cb)
    {
        collection.replaceOne({_id:doc._id}, doc, {w:1}, (err)=>{
            if (err) return cb(err);
        });  
    };

    connectData.removeData = function(uuid, suid, ukey, cb)
    {
        this.getCollection(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection!=null)
            {
                collection.remove({_id:ukey}, {w:1}, (err)=>{
                    if (err) return cb(err);
                    console.log("data remove: sucess");
                });
            }
        });
    };

    connectData.getDataByKey = function(uuid, suid, ukey, cb){
        this.getCollection(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection!=null)
            {
                collection.findOne({_id: ukey}, function(err, data) {
                    console.log("get key: " + uuid + "-" + suid + "-" + ukey);
                    if(err) return cb(err);
                    cb(null, data)
                });
            }
        });
    };

    connectData.getDataByDate = function(uuid, suid, start_time, end_time, cb){
        this.getCollection(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection!=null)
            {
                const startTime = new Date(start_time);
                const endTime = new Date(end_time);

                collection.find({
                    "system_time":{
                        $gte:startTime,
                        $lte:endTime
                    }
                }).toArray(function(err, data){
                    if(err) return cb(err);
                    cb(null, data);
                });
            }
        });
    };

    await connectData.init();
    return connectData;
};

module.exports = connect;