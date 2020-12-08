require('dotenv').config({});
const { ETIMEDOUT } = require('constants');
const { MongoClient, ObjectID } = require('mongodb');

class MongoDB{

    constructor(name, host, port){
        this.serviceName = name;
        this.db_host = "mongodb://"+host+":"+port;
        this.client = new MongoClient(this.db_host, { useUnifiedTopology: true });
    }

    getName(){
        return this.serviceName;
    }

    start(){
        if(this.client!=null)
        {
            this.client.connect();
            this.db = this.client.db(this.serviceName);
        }
    }

    isConnect(){
        return this.client.isConnected();
    }

    getComposeDataSetName(uuid, suid){
        let dataset = uuid;
        if(suid!=null && suid.length>0) dataset+="_"+suid;
        return dataset;
    }

    getCollectionNames(cb){
        const collections = [];
        this.db.listCollections().toArray((err, collInfos)=>{
            if(err) return cb(err);
            collInfos.forEach((doc) => { collections.push(doc.name) });
            cb(collections);
        });
    }  

    getCollection(collectionName, cb){
        this.db.collection(collectionName, function(err,collection){
            if(err) return cb(err);
            cb(null, collection);
        });
    }

    deleteCollection(uuid, suid, cb){
        this.db.collection(this.getComposeDataSetName(uuid, suid)).drop( (err)=>{
            return cb(err);
        });
    }

    createCollection(uuid, suid, cb){
        this.getCollectionNames(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection)
            {
                this.db.createCollection(collectionName, (err)=>{
                    if (err) return cb(err);
                });
            }
        });
    }

    addData(uuid, suid, ukey, value, timestamp, cb)
    {
        this.getCollection(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection!=null)
            {
                const doc = {};
                doc._id = (ukey!=null&&ukey.length>0?ukey:new ObjectID());
                doc.system_time = timestamp;
                doc.data = value;
                this.insertData(doc, collection, cb);
            }
        });
    }

    insertData(doc, collection, cb)
    {
        collection.insertOne(doc, (err)=>{
            if (err) return this.updateData(doc, collection, cb);
        });
    }

    updateData(doc, collection, cb)
    {
        collection.replaceOne({_id:doc._id}, doc, {w:1}, (err)=>{
            if (err) return cb(err);
        });  
    }

    removeData(uuid, suid, ukey, cb)
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
    }

    getDataByKey(uuid, suid, ukey, cb){
        this.getCollection(this.getComposeDataSetName(uuid, suid), (err, collection)=>{
            if(err) return cb(err);
            if(collection!=null)
            {
                collection.findOne({_id: ukey}, function(err, data) {
                    if(err) return cb(err);
                    cb(null, data)
                });
            }
        });
    }

    getDataByDate(uuid, suid, start_time, end_time, cb){
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
    }
}

var mongoClient = new MongoDB(process.env.DEVICE_DB_NAME, 'localhost', process.env.MONGO_PORT);
mongoClient.start();

module.exports = mongoClient;