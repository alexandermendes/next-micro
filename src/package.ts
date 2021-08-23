import fs from 'fs';
import path from 'path';

export type Package = {
  [index: string]: unknown;
  name: string;
  version: string;
};

/**
 * Get the contents of the package.json from the given dir.
 */
export const getPackage = (dir: string): Package | null => {
  const packageJsonPath = path.join(dir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  const buffer = fs.readFileSync(packageJsonPath);

  return JSON.parse(String(buffer));
};
