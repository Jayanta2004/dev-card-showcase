const logger = require('../utils/logger')

const errorHandler = (err, req, res, _next) => {
  logger.error(err.stack || err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ message: `Duplicate value for ${field}` })
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  })
}

module.exports = errorHandler
