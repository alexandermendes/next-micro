import Joi from 'joi';
import fs from 'fs';
import { ConcreteMicroproxyConfig, MicroproxyConfig } from '../config';

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

const getFieldKeyFromState = (state: Joi.State): string => {
  const arr: string[] = (
    Array.isArray(state.path) ? state.path : [state.path]
  ).filter((part) => typeof part !== 'undefined');

  return arr?.reduce((acc: string, value: string | number) => {
    if (typeof value === 'number') {
      return `${acc}[${value}]`;
    }

    return `${acc}${acc.length ? '.' : ''}${value}`;
  }, '');
};

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

const file = (filePath: string, helpers: Joi.CustomHelpers) => {
  const key = getFieldKeyFromState(helpers.state);
  const msg = helpers.message({ custom: `"${key}" is not a valid file"` });
  let stats;

  try {
    stats = fs.lstatSync(filePath);
  } catch (err) {
    return msg;
  }

  if (!stats.isFile()) {
    return msg;
  }

  return filePath;
};

const serviceSchema = Joi.object().keys({
  name: Joi.string().required(),
  port: Joi.number().positive().required(),
  routes: Joi.array().required().items(Joi.string()),
  script: Joi.string().custom(file),
});

// routes must be an array
const schema = Joi.object({
  port: Joi.number().positive().required(),
  autostart: Joi.boolean(),
  services: Joi.array().items(serviceSchema).unique('port').unique('name'),
}).custom(uniqueRootPort);

/**
 * Validate a microproxy config.
 */
export const validate = (config: ConcreteMicroproxyConfig): void => {
  const validationResult = schema.validate(config);
  const errorDetails = validationResult.error?.details[0];

  if (errorDetails) {
    throw new MicroproxyConfigError(errorDetails.message, errorDetails);
  }
};
