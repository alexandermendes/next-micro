import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';

import { ConcreteMicroproxyConfig } from '../config';
import { validate } from './validation';
import { applyDefaults } from './defaults';
import { logger } from '../logger';

/**
 * Load the microproxy config.
 */
export const loadConfig = async (): Promise<ConcreteMicroproxyConfig> => {
  const dir = appRoot.path;
  const explorer = cosmiconfig('microproxy', { stopDir: dir });
  const { config } = (await explorer.search(dir)) || {};

  if (!config) {
    logger.warn('No Microproxy config file was detected.');
  }

  const mergedConfig = applyDefaults(config);

  validate(mergedConfig);

  return applyDefaults(mergedConfig);
};
