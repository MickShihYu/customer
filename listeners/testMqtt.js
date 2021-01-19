const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const MqttClient = require('./mqttClient');
const db = require('./db');
const parser = require("fast-xml-parser");
const DEVICE_NAME = 'device';

let MongoDB = null;

init();

async function init() {
    MongoDB = await db(process.env.MONGO_NAME, 'localhost', process.env.MONGO_PORT);
    const clientList = [];
    clientList.push(new MqttClient('device1', [process.env.MQTT_TOPIC_INFO], deviceInfoCalBack));
    clientList.push(new MqttClient('device2', [process.env.MQTT_TOPIC_CFG], deviceCFGCalBack));
    clientList.push(new MqttClient('device3', [process.env.MQTT_TOPIC_CMD, process.env.MQTT_TOPIC_REPLY, process.env.MQTT_TOPIC_ALERT], deviceCMDCalBack));
    clientList.push(new MqttClient('device4', [process.env.MQTT_TOPIC_CONNECT], deviceConnectCallBack));
}

function deviceInfoCalBack(topic, message) {
    try {
        const { mac_id } = parseTopic(topic);
        const payload = {};
        payload.values = JSON.parse(message);
        payload.values.status = 'online';
        MongoDB.addData(DEVICE_NAME, '', mac_id, payload, new Date(), (err) => { });
    } catch (error) { console.error(error); }
}

function deviceCFGCalBack(topic, message) {
    try {
        const { mac_id, suid } = parseTopic(topic);
        const payload = {};
        payload.values = xmlToJson(message);
        payload.values.status = 'online';
        MongoDB.addData(DEVICE_NAME, suid, mac_id, payload, new Date(), (err) => { });
    } catch (error) { console.error(error); }
}

function deviceCMDCalBack(topic, message) {
    try {
        const { from, mac_id, cmd, suid } = parseTopic(topic);
        const payload = {};
        payload.mac_id = mac_id;
        payload.from = from;
        payload.topic = cmd;
        payload.values = JSON.parse(message);
        payload.values.status = 'online';
        MongoDB.addData(DEVICE_NAME, "commands", "", payload, new Date(), (err) => { });
    } catch (error) { console.error(error); }
}

function deviceConnectCallBack(topic, message) {
    try {
        const { status } = parseTopic(topic);
        const mac_id = JSON.parse(message).clientid;

        //console.log("topic: " + topic);
        //console.log(JSON.parse(message));

        if (isMac(mac_id)) {
            MongoDB.getDataByKey(DEVICE_NAME, "", mac_id, (error, data) => {
                if (!error && data) {
                    const payload = {
                        "mac_id": mac_id,
                        "from": data.from,
                        "topic": data.cmd,
                        "values": data.values
                    };
                    payload.values.status = (status == 'connected' ? 'online' : 'offline');
                    MongoDB.addData(DEVICE_NAME, "", mac_id, payload, new Date(), () => { });
                }
            });
        }
    } catch (error) { console.error(error); }
}

function isMac(mac_id) { return /^#[0-9A-F]{12}$/i.test('#' + mac_id); }

function parseTopic(topic) {
    const topics = topic.split("/");
    const from = (topics.length > 0 ? topics[0] : null);
    const mac_id = (topics.length > 1 ? topics[1].toUpperCase() : null);
    const cmd = (topics.length > 2 ? (topics[2] == "CTL" ? topics[3] : topics[2]) : null);
    const suid = (cmd != null ? (cmd == "reply" ? cmd : cmd.split("_")[1]) : null);
    const status = (topics.length > 5 ? topics[5] : null);
    
    return { from: from, mac_id: mac_id, cmd: cmd, suid: suid, status: status };
}

function xmlToJson(data) {
    data = data.toString();
    var position = data.toString().indexOf('\n');
    if (position != -1) {
        data = data.substr(position + 1);
        const xmlObj = parser.parse(data, { compact: true });
        return xmlObj;
    }
};