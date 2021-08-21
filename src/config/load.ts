import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';

import { validate } from './validation';
import { logger } from '../logger';
import { Config } from './config';

/**
 * Load the microproxy config.
 */
export const loadConfig = async (): Promise<Config> => {
  const dir = appRoot.path;
  const explorer = cosmiconfig('microproxy', { stopDir: dir });
  const { config } = (await explorer.search(dir)) || {};

  if (!config) {
    logger.warn('No Microproxy config file was detected.');
  }

  validate(config);

  return new Config(config);
};
