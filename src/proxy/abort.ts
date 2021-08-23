import { ServerResponse } from 'http';
import { logger } from '../logger';

/**
 * Respond with the given status code.
 */
export const abort = (statusCode: number, res: ServerResponse): void => {
  if (statusCode >= 500) {
    logger.error(`Server Error: ${statusCode}`);
  }

  res.writeHead(statusCode);
  res.end();
};
