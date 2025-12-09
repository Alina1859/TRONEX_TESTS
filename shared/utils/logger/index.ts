import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      singleLine: false,
      hideObject: false,
      messageFormat: '{msg}',
    },
  },
});

const formatArgs = (args: any[]): any => {
  if (args.length === 0) return undefined;
  
  if (args.length === 1 && typeof args[0] === 'string') {
    try {
      const parsed = JSON.parse(args[0]);
      return { data: parsed };
    } catch {
      return { value: args[0] };
    }
  }
  
  const formatted: any = {};
  args.forEach((arg, index) => {
    if (typeof arg === 'string') {
      try {
        formatted[`arg${index}`] = JSON.parse(arg);
      } catch {
        formatted[`arg${index}`] = arg;
      }
    } else {
      formatted[`arg${index}`] = arg;
    }
  });
  return formatted;
};

export const log = {
  info: (message: string, ...args: any[]) => {
    const formatted = formatArgs(args);
    if (formatted) {
      logger.info(formatted, message);
    } else {
      logger.info(message);
    }
  },
  error: (message: string, ...args: any[]) => {
    const formatted = formatArgs(args);
    if (formatted) {
      logger.error(formatted, message);
    } else {
      logger.error(message);
    }
  },
  warn: (message: string, ...args: any[]) => {
    const formatted = formatArgs(args);
    if (formatted) {
      logger.warn(formatted, message);
    } else {
      logger.warn(message);
    }
  },
  debug: (message: string, ...args: any[]) => {
    const formatted = formatArgs(args);
    if (formatted) {
      logger.debug(formatted, message);
    } else {
      logger.debug(message);
    }
  },
};

export default logger;

