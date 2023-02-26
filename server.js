const dotenv = require('dotenv')
const mongoose = require('mongoose')
const logger = require('pino')()
dotenv.config()

const app = require('./app')
const config = require('./config')
const { Session } = require('./classes/session')
const connectToCluster = require('.middleware/connectMongoClient')

let server
if (config.mongoose.enabled) { // mongodb connection 
    mongoose.set('strictQuery', true);
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
        logger.info('Connected to MongoDB')
    })
}
server = app.listen(config.port, async () => { 
    logger.info(`Listening on port ${config.port}`)
    global.mongoClient = await connectToCluster(config.mongoose.url)
    if (config.restoreSessionsOnStartup) {
        logger.info(`Restoring Sessions`)
        const session = new Session()
        let restoreSessions = await session.restoreSessions()
        logger.info(`${restoreSessions.length} Session Restored`)
    }
})


const exitHandler = () => { // close server 
    if (server) {
        server.close(() => {
            logger.info('Server closed')
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
}
const unexpectedErrorHandler = (error) => { // for logging 
    logger.error(error)
    exitHandler()
}
process.on('uncaughtException', unexpectedErrorHandler) // uncaught 
process.on('unhandledRejection', unexpectedErrorHandler) // unhandled 
process.on('SIGTERM', () => {  // on interuption 
    logger.info('SIGTERM received')
    if (server) {
        server.close()
    }
})

module.exports = server