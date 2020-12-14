require('dotenv').config({});
const MqttClient = require('./mqttClient');
const db = require('../server/db');
const fs = require('fs');
const parser = require("fast-xml-parser");
const { RuleTester } = require('eslint');
const { isRegExp } = require('util');

const DEVICE_NAME = 'device';

const mqttCallback = function(topic, message) {
    try {
        const topics = topic.toLowerCase().split("/");
        if(topics.length>0)
        {
            const macId = topics[1];
            const cmd  = (topics[2]=="ctl"?topics[3]:topics[2]);
            let suid = (cmd=="reply"?cmd:cmd.split("_")[1]);

            switch(cmd)
            {
                case "device_info":
                case "device_cfg":
                {
                    let value = null;
                    if(suid=="info"){
                        suid = "";
                        value = JSON.parse(message);
                    }else if(suid=="cfg"){
                        value = xmlToJson(message);
                    } 
                    if(suid!=null)
                        MongoDB.addData(DEVICE_NAME, suid, macId,  value, new Date(), (err)=>{});
                }
                break;
                case "device_cmd":
                case "reply":
                case "device_alert":
                { 
                    const value = JSON.parse(message);
                    value.topic = cmd;
                    MongoDB.addData(DEVICE_NAME, "commands", "", value, new Date(), (err)=>{});
                    console.log("topic: " + topic + " cmd:" + cmd);
                }
                break;
                default:
                    console.log("other message: ", message , "\r\n");
            }
        }
    } catch (error) {
        //console.log(message + "\r\n");
        console.error(error);
    }
};

function xmlToJson(data)
{
    data = data.toString();
    var position = data.toString().indexOf('\n'); 
    if (position != -1) {
        data = data.substr(position + 1);
        const xmlObj = parser.parse(data, {compact: true});
        return xmlObj;
    } 
};

var MongoDB = null;

async function init(){

    MongoDB = await db(process.env.MONGO_NAME, 'localhost', process.env.MONGO_PORT);

    const clientList = [];
    clientList.push(new MqttClient('device1', [process.env.MQTT_TOPIC_INFO], mqttCallback));
    clientList.push(new MqttClient('device2', [process.env.MQTT_TOPIC_CFG], mqttCallback));
    clientList.push(new MqttClient('device3', [process.env.MQTT_TOPIC_CMD, process.env.MQTT_TOPIC_REPLY, process.env.MQTT_TOPIC_ALERT], mqttCallback));
    
}

init(); 

