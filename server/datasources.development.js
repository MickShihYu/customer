module.exports = {
    "customerDB": {
        "host": "localhost",
        "port": process.env.MONGO_PORT,
        "url": "",
        "database": process.env.MONGO_NAME,
        "password": "",
        "name": process.env.MONGO_NAME,
        "user": "",
        "useNewUrlParser": false,
        "connector": "mongodb"
    }
}