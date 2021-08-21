import { MicroproxyConfig, ConcreteMicroproxyConfig } from '../config';

const defaults = {
  port: 3000,
  autostart: false,
  services: [],
};

/**
 * Apply defaults to the microproxy config.
 */
export const applyDefaults = (
  config: MicroproxyConfig,
): ConcreteMicroproxyConfig => ({
  ...defaults,
  ...config,
});
