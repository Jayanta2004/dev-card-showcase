const mongoose = require('mongoose')
const logger = require('./logger')

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    logger.warn('MONGO_URI not set — running in ephemeral mode (no persistence)')
    return
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB || 'finance-tracker' })
    logger.info(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
