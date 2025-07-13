/**
 * Basic Logger Utility
 * In a real application, this would integrate with a more robust logging service
 * like Winston, Pino, or a cloud-based solution (e.g., Google Cloud Logging, Datadog).
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];

const log = (level, message, context = {}) => {
  if (LOG_LEVELS[level] >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // For simplicity, log to console. In production, send to a logging service.
    if (level === 'ERROR') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'WARN') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
};

export const logger = {
  debug: (message, context) => log('DEBUG', message, context),
  info: (message, context) => log('INFO', message, context),
  warn: (message, context) => log('WARN', message, context),
  error: (message, context) => log('ERROR', message, context),
};
