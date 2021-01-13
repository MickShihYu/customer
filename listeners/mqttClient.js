const mqtt = require('mqtt');

class MqttClient {
    constructor(deviceId, topic, callback) {
        this.deviceId = deviceId;
        this.topic = topic;

        this.mqttClient = mqtt.connect(process.env.MQTT_OPTIONS_URL, {
            clientId: deviceId,
            username: process.env.MQTT_OPTIONS_USERNAME,
            password: process.env.MQTT_OPTIONS_PASSWORD
        });

        this.mqttClient.on('connect', () => {
            this.topic.forEach(element => {
                this.mqttClient.subscribe(element);
                console.log('Connected to broker: ' + element);
            });

        });

        this.mqttClient.on('error', (error) => {
            console.error(error);
        });

        this.mqttClient.on('message', callback);

        this.isAlive = {
            connected: this.mqttClient.connected
        };
    }
}

module.exports = MqttClient;
