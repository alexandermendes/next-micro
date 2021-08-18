import { createLogger } from './create';

export * from './types';
export { createLogger };
export { createLogStream } from './stream';

// Default/global logger.
export const logger = createLogger({
  logLevel: process.env.MICROPROXY_LOG_LEVEL,
  tag: 'microproxy',
});
