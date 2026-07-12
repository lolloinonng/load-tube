const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || 'debug';

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  error: (message: string, meta?: unknown) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
  warn: (message: string, meta?: unknown) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  info: (message: string, meta?: unknown) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.info) {
      console.log(formatMessage('info', message, meta));
    }
  },
  debug: (message: string, meta?: unknown) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', message, meta));
    }
  },
};
