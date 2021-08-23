import fs from 'fs';
import { mocked } from 'ts-jest/utils';
import { getNextConfig } from '../../src/next-config';

jest.mock('fs');

const mockFs = mocked(fs);

describe('Next Config', () => {
  it('returns the contents of the next.config.js', () => {
    mockFs.existsSync.mockReturnValue(true);
    jest.doMock(
      '/path/to/service/next.config.js',
      () => ({
        distDir: 'my-next-config/dist',
      }),
      { virtual: true },
    );

    const nextConfig = getNextConfig('/path/to/service');

    expect(mockFs.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFs.existsSync).toHaveBeenCalledWith(
      '/path/to/service/next.config.js',
    );

    expect(nextConfig).toEqual({
      distDir: 'my-next-config/dist',
    });
  });

  it('returns null if there is no next.config.js', () => {
    mockFs.existsSync.mockReturnValue(false);

    const nextConfig = getNextConfig('/path/to/service');

    expect(nextConfig).toBeNull();
  });
});
