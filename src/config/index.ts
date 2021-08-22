import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';

import { validate } from './validation';
import { logger } from '../logger';

export type ServiceConfig = {
  rootDir: string;
  name?: string;
  port?: number;
  routes?: string[];
  script?: string;
  scriptWaitTimeout?: number;
  watch?: boolean;
  ttl?: number;
  env?: Record<string, unknown>;
};

export type MicroproxyConfig = {
  port?: number;
  autoload?: boolean;
  autostart?: boolean;
  services?: ServiceConfig[];
};

export type ConcreteMicroproxyConfig = {
  port: number;
  autoload: boolean;
  autostart: boolean;
  services: ServiceConfig[];
};

const defaults = {
  autoload: true,
  port: 3000,
  autostart: false,
  services: [],
};

/**
 * Load the microproxy config.
 */
export const loadConfig = async (): Promise<ConcreteMicroproxyConfig> => {
  const dir = appRoot.path;
  const explorer = cosmiconfig('microproxy', { stopDir: dir });
  const { config } = (await explorer.search(dir)) || {};

  validate(config);

  return {
    ...defaults,
    ...config,
  };
};
