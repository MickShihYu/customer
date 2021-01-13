const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const MqttClient = require('./mqttClient');
const db = require('./db');
const parser = require("fast-xml-parser");
const DEVICE_NAME = 'device';

const mqttCallBack = function (topic, message) {
    try {
        const topics = topic.split("/");
        if (topics.length > 0) {
            const macId = topics[1].toUpperCase();
            const cmd = (topics[2] == "CTL" ? topics[3] : topics[2]);
            let suid = (cmd == "reply" ? cmd : cmd.split("_")[1]);

            switch (cmd) {
                case "device_info":
                case "device_cfg":
                    {
                        let payload = null;
                        if (suid == "info") {
                            suid = "";
                            payload = {};
                            payload.values = JSON.parse(message);
                            payload.values.status = 'online';

                        } else if (suid == "cfg") {
                            payload = {};
                            payload.values = xmlToJson(message);
                        }

                        if (payload != null) {
                            MongoDB.addData(DEVICE_NAME, suid, macId, payload, new Date(), (err) => { });
                        }
                    }
                    break;
                case "device_cmd":
                case "reply":
                case "device_alert":
                    {
                        const value = JSON.parse(message);
                        const payload = {
                            "mac_id": macId,
                            "from": topics[0],
                            "topic": cmd,
                            "values": value
                        };

                        MongoDB.addData(DEVICE_NAME, "commands", "", payload, new Date(), (err) => { });
                    }
                    break;
                default:
                    const value = JSON.parse(message);
                    console.log("message: ", value, "\r\n");
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const connectCallBack = function (topic, message) {
    try {

        //console.log("topic: " + topic);

        const topics = topic.split("/");
        const status = topics[5];

        message = JSON.parse(message);
        const mac = message.clientid;

        if (isMac(mac)) {
            MongoDB.getDataByKey(DEVICE_NAME, "", mac, (error, data) => {
                if (!error && data) {
                    const payload = {
                        "mac_id": mac,
                        "from": data.from,
                        "topic": data.cmd,
                        "values": data.values
                    };
                    payload.values.status = (status == 'connected' ? 'online' : 'offline');
                    MongoDB.addData(DEVICE_NAME, "", mac, payload, new Date(), () => { });
                }
            });
        }

    } catch (error) {
        console.error(error);
    }
}

function isMac(mac) { return /^#[0-9A-F]{12}$/i.test('#' + mac); }

function xmlToJson(data) {
    data = data.toString();
    var position = data.toString().indexOf('\n');
    if (position != -1) {
        data = data.substr(position + 1);
        const xmlObj = parser.parse(data, { compact: true });
        return xmlObj;
    }
};

var MongoDB = null;

init();

async function init() {

    MongoDB = await db(process.env.MONGO_NAME, 'localhost', process.env.MONGO_PORT);

    const clientList = [];
    clientList.push(new MqttClient('device1', [process.env.MQTT_TOPIC_INFO], mqttCallBack));
    clientList.push(new MqttClient('device2', [process.env.MQTT_TOPIC_CFG], mqttCallBack));
    clientList.push(new MqttClient('device3', [process.env.MQTT_TOPIC_CMD, process.env.MQTT_TOPIC_REPLY, process.env.MQTT_TOPIC_ALERT], mqttCallBack));
    clientList.push(new MqttClient('device4', [process.env.MQTT_TOPIC_CONNECT], connectCallBack));

}

