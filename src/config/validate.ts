import { MicroproxyConfig } from '../types/config';

class MicroproxyConfigError extends Error {}

/**
 * Check that all values of a property are unique across service configs.
 */
const validateUniqueProperty = (config: MicroproxyConfig, key: string): void => {
  const values = config.services.map(({ [key]: value }) => value);

  const duplicateValues = values.filter(
    (item, index) => values.indexOf(item) !== index,
  );

  const uniqueDuplicateValues = Array.from(new Set(duplicateValues));

  if (uniqueDuplicateValues.length) {
    throw new MicroproxyConfigError(
      `Duplicate ${key}(s) found in service configs: ${uniqueDuplicateValues.join(', ')}`,
    );
  }
};

/**
 * Check that various properties are unique across service configs.
 */
const validateUniqueProperties = (config: MicroproxyConfig): void => {
  ['name', 'port'].forEach((key) => {
    validateUniqueProperty(config, key);
  });
};

/**
 * Check that a required property is present across all service configs.
 */
const validateRequiredProperty = (config: MicroproxyConfig, key: string): void => {
  config.services.forEach((serviceConfig) => {
    if (!serviceConfig[key]) {
      throw new MicroproxyConfigError(`All service configs must include the "${key}" property.`);
    }
  });
};

/**
 * Check that any required properties are present.
 */
const validateRequiredProperties = (config: MicroproxyConfig): void => {
  ['name', 'port'].forEach((key) => {
    validateRequiredProperty(config, key);
  });
};

/**
 * Validate a microproxy config.
 */
export const validate = (
  config: MicroproxyConfig | undefined,
  dir: string,
): void => {
  if (!config) {
    throw new MicroproxyConfigError(`No config could be loaded from ${dir}`);
  }

  validateRequiredProperties(config);
  validateUniqueProperties(config);
};
