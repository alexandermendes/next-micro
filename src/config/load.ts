import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';

import { MicroproxyConfig } from '../types/config';
import { validate } from './validate';

/**
 * Load the microproxy config.
 */
export const loadConfig = async (): Promise<MicroproxyConfig> => {
  const dir = appRoot.path;
  const explorer = cosmiconfig('microproxy', { stopDir: dir });
  const { config } = (await explorer.search(dir)) || {};

  validate(config, dir);

  return config;
};
