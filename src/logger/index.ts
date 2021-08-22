import { createLogger } from './create';

export * from './types';
export { createLogger };
export { createLogStream } from './stream';

// Default/global logger.
export const logger = createLogger({
  logLevel: process.env.NEXT_MICRO_LOG_LEVEL,
  tag: 'nextmicro',
});
