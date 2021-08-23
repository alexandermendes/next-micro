import fs from 'fs';
import path from 'path';

/**
 * Get the next config object from the given dir, if one exists.
 */
export const getNextConfig = (dir: string): Record<string, unknown> | null => {
  const nextConfigPath = path.join(dir, 'next.config.js');

  if (!fs.existsSync(nextConfigPath)) {
    return null;
  }

  return require(nextConfigPath);
};
