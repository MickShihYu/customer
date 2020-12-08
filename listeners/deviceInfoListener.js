require('dotenv').config({});
const mqtt = require('mqtt');

mqttClient = mqtt.connect(process.env.MQTT_OPTIONS_URL, {
  clientId: 'Mick Fx 2',
  username: process.env.MQTT_OPTIONS_USERNAME,
  password: process.env.MQTT_OPTIONS_PASSWORD
});


mqttClient.on('connect', () => {
  console.log('Connected to broker');
  mqttClient.subscribe(process.env.MQTT_TOPIC_INFO);
});

mqttClient.on('error', (error) => {
  console.error(error);
});

mqttClient.on('message', function (topic, message) {
  try {
    const content = JSON.parse(message.toString());
    //console.log(JSON.stringify(content, null, 2));

    if(content)
    {
      const mac_id = topic.split("/")[1];
      console.log("Topic:" + topic);
    }
  } catch (error) {console.error(error);}
});



