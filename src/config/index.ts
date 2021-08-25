import { cosmiconfig } from 'cosmiconfig';
import appRoot from 'app-root-path';

import { validate } from './validation';

export type ServiceConfig = {
  [x: string]: unknown;
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
  ignore?: string[];
};

export type ConcreteNextMicroConfig = {
  port: number;
  autoload: boolean;
  autostart: boolean;
  services: ServiceConfig[];
  ignore: string[];
};

const defaults = {
  port: 3000,
  autoload: true,
  autostart: true,
  services: [],
  ignore: ['/node_modules/'],
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
