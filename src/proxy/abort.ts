import httpStatus from 'http-status';

class AbortError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Throw an error with the given status code.
 *
 * This error is intended to be picked up by error handling middleware.
 */
export const abort = (statusCode: number): void => {
  const err = new AbortError(statusCode, String(httpStatus[statusCode]));

  throw err;
};
