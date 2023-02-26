const { MongoClient } = require('mongodb')
const logger = require('pino')()

module.exports = async function connectToCluster(uri) {
    let mongoClient

    try {
        mongoClient = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        logger.info(' Connecting to MongoDB')
        await mongoClient.connect()
        logger.info('Successfully connected to MongoDB')
        return mongoClient
    } catch (error) {
        logger.error('Connection to MongoDB failed!', error)
        process.exit()
    }
}
