const morgan = require('morgan')
const logger = require('./logger')

/**
 * Streams Morgan's HTTP access-log lines into the structured logger.
 *
 * Morgan produces a pre-formatted string per request (e.g. the "combined"
 * format). Routing it through this stream means every access log is emitted as
 * a structured `http` log entry with a consistent level and metadata, rather
 * than a free-form console line, so it is queryable alongside application logs.
 */
const stream = {
  write: (message) => {
    const line = message.trim()
    if (line) {
      logger.http(line)
    }
  },
}

// Skip access logging during tests to keep test output clean.
const skip = () => process.env.NODE_ENV === 'test'

/**
 * Express middleware that logs each incoming HTTP request via the structured
 * logger. Replaces the previous `morgan('combined')` usage, which wrote
 * unstructured lines directly to stdout.
 */
function requestLogger() {
  return morgan('combined', { stream, skip })
}

module.exports = requestLogger
