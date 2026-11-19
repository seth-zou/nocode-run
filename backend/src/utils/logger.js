const winston = require('winston')

const { combine, timestamp, printf, colorize, errors } = winston.format

/**
 * Log format used for every transport.
 *
 * Emits a single JSON-serializable line per log entry so the output can be
 * ingested by structured-log aggregators (e.g. ELK, Datadog, CloudWatch) while
 * still being readable on the console during local development.
 */
const logFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const base = {
      timestamp,
      level,
      message,
    }

    // Attach any structured metadata passed to the log call so it travels
    // alongside the message in a predictable, machine-parseable shape.
    if (Object.keys(meta).length > 0) {
      base.meta = meta
    }

    if (stack) {
      base.stack = stack
    }

    return JSON.stringify(base)
  })
)

const consoleFormat = combine(
  colorize(),
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length > 0
      ? ` ${JSON.stringify(meta)}`
      : ''
    const stackString = stack ? `\n${stack}` : ''
    return `${timestamp} ${level}: ${message}${metaString}${stackString}`
  })
)

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

/**
 * Shared application logger.
 *
 * Usage:
 *   const logger = require('./utils/logger')
 *   logger.info('Server started', { port: 3003 })
 *   logger.error('Database error', { error: err })
 */
const logger = winston.createLogger({
  level,
  format: logFormat,
  defaultMeta: { service: 'nocode-run-backend' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  exitOnError: false,
})

module.exports = logger
