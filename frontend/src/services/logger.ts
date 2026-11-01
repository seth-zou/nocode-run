/**
 * Structured frontend logger.
 *
 * Provides a small, dependency-free logger that emits structured log entries
 * to the browser console. Each entry carries a level, message, timestamp, and
 * an optional `context` object so that logs are consistent and grep-able
 * across the app instead of ad-hoc `console.error(...)` calls.
 *
 * Levels are configurable at runtime (see setLogLevel) and the noisiest levels
 * are suppressed in production to avoid leaking diagnostic noise to end users.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

const LEVEL_ORDER: Record<Exclude<LogLevel, 'none'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function resolveInitialLevel(): LogLevel {
  // Production builds run with a quieter floor by default.
  if (import.meta.env.PROD) {
    return 'warn'
  }
  const envLevel = import.meta.env.VITE_LOG_LEVEL as string | undefined
  if (envLevel && envLevel in LEVEL_ORDER) {
    return envLevel as LogLevel
  }
  return 'info'
}

let currentLevel: LogLevel = resolveInitialLevel()

/**
 * Override the minimum log level at runtime. Useful for tests or when
 * enabling verbose diagnostics from the console.
 */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level
}

/** Read the currently active minimum log level. */
export function getLogLevel(): LogLevel {
  return currentLevel
}

function shouldLog(level: Exclude<LogLevel, 'none'>): boolean {
  if (currentLevel === 'none') {
    return false
  }
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel as Exclude<LogLevel, 'none'>]
}

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: LogContext
}

function buildEntry(level: Exclude<LogLevel, 'none'>, message: string, context?: LogContext): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }
  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }
  return entry
}

/**
 * Route each entry to the matching console method so the browser's native
 * severity filtering and stack traces are preserved. The structured entry is
 * passed as the first argument so it shows up as an expandable object in dev
 * tools, while the human-readable message is included for quick scanning.
 */
function emit(level: Exclude<LogLevel, 'none'>, entry: LogEntry): void {
  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(entry)
      break
    case 'info':
      // eslint-disable-next-line no-console
      console.info(entry)
      break
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(entry)
      break
    case 'error':
      // eslint-disable-next-line no-console
      console.error(entry)
      break
  }
}

function log(level: Exclude<LogLevel, 'none'>, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return
  }
  emit(level, buildEntry(level, message, context))
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    log('debug', message, context)
  },
  info(message: string, context?: LogContext): void {
    log('info', message, context)
  },
  warn(message: string, context?: LogContext): void {
    log('warn', message, context)
  },
  error(message: string, context?: LogContext): void {
    log('error', message, context)
  },
}

export default logger
