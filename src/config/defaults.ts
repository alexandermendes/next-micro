import { MicroproxyConfig, ConcreteMicroproxyConfig } from '../config';

const rootDefaults = {
  port: 3000,
  autostart: false,
  services: [],
};

const serviceDefaults = {
  routes: [],
};

/**
 * Apply defaults to the microproxy config.
 */
export const applyDefaults = (
  config: MicroproxyConfig,
): ConcreteMicroproxyConfig => {
  const mergedConfig = { ...rootDefaults, ...config };

  mergedConfig.services.map((service) => ({
    ...serviceDefaults,
    ...service,
  }));

  return mergedConfig;
};
