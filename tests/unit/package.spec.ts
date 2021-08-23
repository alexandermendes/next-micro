import fs from 'fs';
import { mocked } from 'ts-jest/utils';
import { getPackage } from '../../src/package';

jest.mock('fs');

const mockFs = mocked(fs);

describe('Package', () => {
  it('returns the contents of the package.json', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      Buffer.from(
        JSON.stringify({
          name: 'my-service',
          version: '1.2.3',
        }),
      ),
    );

    const pkg = getPackage('/path/to/service');

    expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      '/path/to/service/package.json',
    );

    expect(pkg).toEqual({
      name: 'my-service',
      version: '1.2.3',
    });
  });

  it('returns null if there is no package.json', () => {
    mockFs.existsSync.mockReturnValue(false);

    const pkg = getPackage('/path/to/service');

    expect(pkg).toBeNull();
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });
});
