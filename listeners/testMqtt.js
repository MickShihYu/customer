require('dotenv').config({});
const MqttClient = require('./mqttClient');
const MongoDB = require('../db');
const fs = require('fs');
const parser = require("fast-xml-parser");

const mqttCallback = function(topic, message) {
    try {
        console.log("topic: " + topic);

        const topics = topic.toLowerCase().split("/");
        if(topics.length>0)
        {
            const uuid = topics[0];
            const suid = topics[1];
            const cmd  = (topics[2]=="ctl"?topics[3]:topics[2]);

            switch(cmd)
            {
                case "device_info":
                case "device_cmd":
                case "reply":
                case "device_alert":
                { 
                    try {
                        const value = JSON.parse(message);
                        value.topic = cmd;
                        MongoDB.addData(uuid, suid+"_info", "", value, new Date(), (err)=>{});
                    }
                    catch (error) {
                        console.log(message + "\r\n");
                        console.error(error);
                    }
                }
                break;
                case "device_cfg":
                {
                    const xml = xmlToJson(message);
                    MongoDB.addData("device", "cfg", suid+"_cfg",  xml, new Date(), (err)=>{});
                    console.log(JSON.stringify(xml) + "\r\n");
                }
                break;
                default:
                    console.log(message + "\r\n");
            }
        }
    } 
    catch (error) {console.error(error);}
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
}

const clientList = [];
clientList.push(new MqttClient('device1', [process.env.MQTT_TOPIC_INFO], mqttCallback));
clientList.push(new MqttClient('device2', [process.env.MQTT_TOPIC_CFG], mqttCallback));
clientList.push(new MqttClient('device3', [process.env.MQTT_TOPIC_CMD, process.env.MQTT_TOPIC_REPLY, process.env.MQTT_TOPIC_ALERT], mqttCallback));

console.log("alive:" + clientList[0].isAlive);