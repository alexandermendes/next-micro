import path from 'path';
import glob from 'glob';

const SUPPORTED_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];

/**
 * Convert a file path to a Next.js page path.
 */
const getPage = (filePath: string): string => {
  const page = filePath
    .replace(/^(src\/)?pages/, '')
    .replace(new RegExp(`\\.+(${SUPPORTED_EXTENSIONS.join('|')})$`), '')
    .replace(/\\/g, '/')
    .replace(/\/index$/, '');

  return page === '' ? '/' : page;
};

/**
 * Filter out any non-supported extensions.
 */
const filterSupportedExtensions = (filePath: string): boolean => {
  const ext = path.extname(filePath);

  return SUPPORTED_EXTENSIONS.includes(ext.replace(/^\./, ''));
};

/**
 * Filter out any internal Next.js pages (e.g. _document.js).
 */
const filterNonInternalPages = (filePath: string): boolean => !filePath.match(/^\/_/);

/**
 * Get the the file paths from the pages dir of a Next service.
 *
 * Next supports /pages and /src/pages. We currently use the latter but still
 * check both.
 */
export const getNextPages = (cwd: string): string[] => {
  const files = glob.sync('{src/,}pages/**/*.{j,t}s{,x}', { cwd });
  const supportedFiles = files.filter(filterSupportedExtensions);
  const pages = supportedFiles.map(getPage);

  return pages.filter(filterNonInternalPages);
};
