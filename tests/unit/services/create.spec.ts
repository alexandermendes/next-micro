import glob from 'glob';
import { mocked } from 'ts-jest/utils';
import { ConcreteNextMicroConfig } from '../../../src/config';
import { createServices } from '../../../src/services/create';
import { Service } from '../../../src/services/service';
import { getPackage } from '../../../src/package';
import { getNextConfig } from '../../../src/next-config';

jest.mock('glob');
jest.mock('../../../src/services/service');
jest.mock('../../../src/package');
jest.mock('../../../src/next-config');

const mockGlobSync = mocked(glob.sync);
const mockGetPackage = mocked(getPackage);
const mockGetNextConfig = mocked(getNextConfig);

describe('Services: Create', () => {
  beforeEach(() => {
    mockGlobSync.mockReturnValue([]);
    mockGetPackage.mockReturnValue(null);
    mockGetNextConfig.mockReturnValue(null);
  });

  it('autoloads Next.js services', () => {
    mockGlobSync.mockReturnValue([
      '/path/to/service/one/next.config.js',
      '/path/to/service/two/next.config.js',
    ]);

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [],
    };

    const services = createServices(config, '/root');

    expect(services).toHaveLength(2);
    expect(services[0]).toBeInstanceOf(Service);
    expect(services[1]).toBeInstanceOf(Service);
    expect(Service).toHaveBeenCalledTimes(2);
    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      null,
      null,
    );

    expect(Service).toHaveBeenCalledWith(
      1,
      { rootDir: '/path/to/service/two' },
      null,
      null,
    );
  });

  it('loads defined services', () => {
    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [
        { rootDir: '/path/to/service/one' },
        { rootDir: '/path/to/service/two' },
      ],
    };

    const services = createServices(config, '/root');

    expect(services).toHaveLength(2);
    expect(services[0]).toBeInstanceOf(Service);
    expect(services[1]).toBeInstanceOf(Service);
    expect(Service).toHaveBeenCalledTimes(2);
    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      null,
      null,
    );

    expect(Service).toHaveBeenCalledWith(
      1,
      { rootDir: '/path/to/service/two' },
      null,
      null,
    );
  });

  it('includes the package.json when creating services', () => {
    const pkg = {
      name: 'my-service',
      version: '1.2.3',
    };

    mockGetPackage.mockReturnValue(pkg);

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [{ rootDir: '/path/to/service/one' }],
    };

    createServices(config, '/root');

    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      null,
      pkg,
    );
  });

  it('includes the next config when creating services', () => {
    const nextConfig = {
      distDir: 'my-next-service/dist',
    };

    mockGetNextConfig.mockReturnValue(nextConfig);

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [{ rootDir: '/path/to/service/one' }],
    };

    createServices(config, '/root');

    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      nextConfig,
      null,
    );
  });
});
