import Joi from 'joi';
import { MicroproxyConfig } from '../types/config';

class MicroproxyConfigError extends Error {
  constructor(
    message: string,
    details: Joi.ValidationErrorItem | undefined = undefined,
  ) {
    let finalMessage = `Microproxy Config Error: ${message}`;

    // Specify the field within an array that failed uniqueness validation.
    if (details?.type === 'array.unique' && !!details.context?.path) {
      finalMessage += ` for "${details.context.path}"`;
    }

    super(finalMessage);
  }
}

const uniqueRootPort = (
  config: MicroproxyConfig,
  helpers: Joi.CustomHelpers,
) => {
  const collidingIndex = config?.services.findIndex(
    ({ port }) => port === config.port,
  );

  if (collidingIndex > -1) {
    return helpers.message({
      custom: `"port" collides with "services[${collidingIndex}].port"`,
    });
  }

  return config;
};

const serviceSchema = Joi.object().keys({
  name: Joi.string().required(),
  port: Joi.number().positive().required(),
  routes: Joi.array().required().items(Joi.string()),
});

// routes must be an array
const schema = Joi.object({
  port: Joi.number().positive().required(),
  services: Joi.array().items(serviceSchema).unique('port').unique('name'),
}).custom(uniqueRootPort);

/**
 * Validate a microproxy config.
 */
export const validate = (
  config: MicroproxyConfig | undefined,
  dir: string,
): void => {
  if (!config) {
    throw new MicroproxyConfigError(`config could be loaded from ${dir}`);
  }

  const validationResult = schema.validate(config);
  const errorDetails = validationResult.error?.details[0];

  if (errorDetails) {
    throw new MicroproxyConfigError(errorDetails.message, errorDetails);
  }
};
