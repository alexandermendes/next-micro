import { createLogger } from './create';

export { createLogger };

export const logger = createLogger({
  logLevel: process.env.MICROPROXY_LOG_LEVEL,
});
