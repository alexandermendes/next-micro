import Joi from 'joi';
import fs from 'fs';
import { MicroproxyConfig } from '../../config';

/**
 * Get the key to a field from the Joi state.
 *
 * For example, `port` or `services[1].port`. Seems like there should be
 * something built in to Joi to handle this, couldn't find it though.
 */
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

/**
 * Assert that the root port does not collide with any service ports.
 */
export const uniqueRootPort = (
  config: MicroproxyConfig,
  helpers: Joi.CustomHelpers,
): MicroproxyConfig | Joi.ErrorReport => {
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

/**
 * Assert that a field points to a valid file.
 */
export const file = (
  filePath: string,
  helpers: Joi.CustomHelpers,
): string | Joi.ErrorReport => {
  const key = getFieldKeyFromState(helpers.state);
  const msg = helpers.message({ custom: `"${key}" is not a valid file` });
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
