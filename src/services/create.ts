import path from 'path';
import glob from 'glob';
import { Service } from './service';
import { ConcreteNextMicroConfig } from '../config';
import { getPackage } from '../package';
import { getNextConfig } from '../next-config';

/**
 * Find directories that contain a Next.js config file.
 */
const findNextServices = (cwd: string): string[] => {
  const nextConfigFiles = glob.sync('**/next.config.js', {
    cwd,
    absolute: true,
  });

  return nextConfigFiles.map(path.dirname);
};

/**
 * Create the services.
 */
export const createServices = (
  config: ConcreteNextMicroConfig,
  cwd: string,
): Service[] => {
  const { autoload, services } = config;
  const serviceConfigs = [...services];

  if (autoload) {
    findNextServices(cwd).forEach((rootDir) => {
      serviceConfigs.push({ rootDir });
    });
  }

  return serviceConfigs.map(
    (serviceConfig) =>
      new Service(
        serviceConfig,
        getNextConfig(serviceConfig.rootDir),
        getPackage(serviceConfig.rootDir),
      ),
  );
};
