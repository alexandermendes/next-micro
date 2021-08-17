import { ServerResponse } from 'http';
import { logger } from '../logger';

/**
 * Throw an error with the given status code.
 *
 * This error is intended to be picked up by error handling middleware.
 */
export const abort = (statusCode: number, res: ServerResponse): void => {
  if (statusCode >= 500) {
    logger.error(`Server Error: ${statusCode}`);
  }

  res.writeHead(statusCode);
  res.end(String(statusCode));
};
