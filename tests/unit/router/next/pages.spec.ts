import glob from 'glob';
import { mocked } from 'ts-jest/utils';
import { getNextPages } from '../../../../src/router/next/pages';

jest.mock('glob');

const mockGlobSync = mocked(glob.sync);

describe('Router: Next - Pages', () => {
  afterEach(() => {
    mockGlobSync.mockReturnValue([]);
  });

  it.each([
    'js',
    'jsx',
    'ts',
    'tsx',
  ])('includes %s files', (ext) => {
    mockGlobSync.mockReturnValue([
      `src/pages/index.${ext}`,
      `src/pages/thing.${ext}`,
      `src/pages/stuff/index.${ext}`,
      `src/pages/stuff/[id].${ext}`,
    ]);

    const cwd = '/service';
    const pages = getNextPages(cwd);

    expect(mockGlobSync).toHaveBeenCalledTimes(1);
    expect(mockGlobSync).toHaveBeenCalledWith('{src/,}pages/**/*.{j,t}s{,x}', { cwd });
    expect(pages).toEqual([
      '/',
      '/thing',
      '/stuff',
      '/stuff/[id]',
    ]);
  });

  it('filters out internal pages', () => {
    mockGlobSync.mockReturnValue([
      'src/pages/_app.js',
      'src/pages/_document.js',
      'src/pages/_error.js',
    ]);

    const cwd = '/service';
    const pages = getNextPages(cwd);

    expect(pages).toEqual([]);
  });
});
