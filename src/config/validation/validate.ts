import { ConcreteMicroproxyConfig } from '../../config';
import { MicroproxyConfigError } from './error';
import { getSchema } from './schema';

/**
 * Validate a microproxy config.
 */
export const validate = (config: ConcreteMicroproxyConfig): void => {
  const schema = getSchema();
  const validationResult = schema.validate(config);
  const errorDetails = validationResult.error?.details[0];

  if (errorDetails) {
    throw new MicroproxyConfigError(errorDetails.message, errorDetails);
  }
};
