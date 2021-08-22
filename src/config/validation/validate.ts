import { NextMicroConfig } from '../index';
import { NextMicroConfigError } from './error';
import { getSchema } from './schema';

/**
 * Validate a nextmicro config.
 */
export const validate = (config: NextMicroConfig): void => {
  const schema = getSchema();
  const validationResult = schema.validate(config);
  const errorDetails = validationResult.error?.details[0];

  if (errorDetails) {
    throw new NextMicroConfigError(errorDetails.message, errorDetails);
  }
};
