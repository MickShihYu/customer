const {
    createLogger,
    transports,
    format
} = require('winston');

require('winston-mongodb');

const logger = createLogger({
    transports: [
        new transports.MongoDB({
            level: 'info',
            db: process.env.MONGO_URL,
            options: {
                useUnifiedTopology: true
            },
            collection: 'log_info',
            format: format.combine(format.timestamp(), format.json())
        }),
        new transports.MongoDB({
            level: 'error',
            db: process.env.MONGO_URL,
            options: {
                useUnifiedTopology: true
            },
            collection: 'log_error',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
})

module.exports = logger;