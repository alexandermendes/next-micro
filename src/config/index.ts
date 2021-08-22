import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';

import { validate } from './validation';

export type ServiceConfig = {
  rootDir: string;
  name?: string;
  version?: string;
  port?: number;
  routes?: string[];
  script?: string;
  scriptWaitTimeout?: number;
  watch?: boolean;
  ttl?: number;
  env?: Record<string, unknown>;
};

export type NextMicroConfig = {
  port?: number;
  autoload?: boolean;
  autostart?: boolean;
  services?: ServiceConfig[];
};

export type ConcreteNextMicroConfig = {
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
 * Load the nextmicro config.
 */
export const loadConfig = async (): Promise<ConcreteNextMicroConfig> => {
  const dir = appRoot.path;
  const explorer = cosmiconfig('nextmicro', { stopDir: dir });
  const { config } = (await explorer.search(dir)) || {};

  validate(config);

  return {
    ...defaults,
    ...config,
  };
};
