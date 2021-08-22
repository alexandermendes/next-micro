import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { Service } from './service';
import { ConcreteNextMicroConfig, ServiceConfig } from '../config';

type Package = {
  name: string;
  version: string;
  [restProps: string]: unknown;
};

/**
 * Find directories that contain a Next.js config file.
 */
const findNextServices = (cwd: string): string[] => {
  const nextConfigFiles = glob.sync('next.config.js', {
    cwd,
    absolute: true,
  });

  return nextConfigFiles.map(path.dirname);
};

/**
 * Get the content of the package.json from the given dir.
 */
const getPackage = (dir: string): Package => {
  const packageJsonPath = path.join(dir, 'package.json');
  const buffer = fs.readFileSync(packageJsonPath);

  return JSON.parse(String(buffer));
};

/**
 * Apply any defaults to the service configs.
 */
const applyDefaults = (serviceConfig: ServiceConfig): ServiceConfig => {
  const { name, version } = getPackage(serviceConfig.rootDir);

  const defaults = {
    name,
    version,
  };

  return {
    ...defaults,
    ...serviceConfig,
  };
};

/**
 * Create the services.
 */
export const createServices = (
  config: ConcreteNextMicroConfig,
  cwd: string,
): Service[] => {
  const { autoload, services } = config;
  const mergedServiceConfigs = [...services];

  if (autoload) {
    findNextServices(cwd).forEach((rootDir) => {
      mergedServiceConfigs.push(<ServiceConfig>{
        rootDir,
      });
    });
  }

  return mergedServiceConfigs.map(
    (serviceConfig) => new Service(applyDefaults(serviceConfig)),
  );
};
