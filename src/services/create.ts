import path from 'path';
import glob from 'glob';
import { Service } from './service';
import { ConcreteNextMicroConfig } from '../config';
import { getPackage } from '../package';
import { getNextConfig } from '../next-config';

/**
 * Find directories that contain a Next.js config file.
 */
const findNextServices = (cwd: string, ignore: string[]): string[] => {
  const nextConfigFiles = glob.sync('**/next.config.js', {
    cwd,
    absolute: true,
  });

  return nextConfigFiles.map(path.dirname).filter((dir) => !ignore.includes(dir));
};

/**
 * Create the services.
 */
export const createServices = (
  config: ConcreteNextMicroConfig,
  cwd: string,
  env?: string,
): Service[] => {
  const { autoload, services, ignore } = config;
  const serviceConfigs = [...services];
  const serviceDirs = serviceConfigs.map(({ rootDir }) => rootDir);

  if (autoload) {
    findNextServices(cwd, serviceDirs).forEach((rootDir) => {
      serviceConfigs.push({ rootDir });
    });
  }

  const filteredServiceConfigs = serviceConfigs.filter(
    ({ rootDir }) =>
      !ignore.some((pattern) => new RegExp(pattern).test(rootDir)),
  );

  return filteredServiceConfigs.map(
    (serviceConfig, index) =>
      new Service(
        index,
        serviceConfig,
        getNextConfig(serviceConfig.rootDir),
        getPackage(serviceConfig.rootDir),
        env,
      ),
  );
};
