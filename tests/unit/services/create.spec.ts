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
      ignore: [],
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
      undefined,
    );

    expect(Service).toHaveBeenCalledWith(
      1,
      { rootDir: '/path/to/service/two' },
      null,
      null,
      undefined,
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
      ignore: [],
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
      undefined,
    );

    expect(Service).toHaveBeenCalledWith(
      1,
      { rootDir: '/path/to/service/two' },
      null,
      null,
      undefined,
    );
  });

  it('does not also autoload specifically defined Next.js services', () => {
    const serviceDir = '/path/to/service';

    mockGlobSync.mockReturnValue([
      `${serviceDir}/next.config.js`,
    ]);

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [
        { rootDir: serviceDir },
      ],
      ignore: [],
    };

    const services = createServices(config, '/root');

    expect(services).toHaveLength(1);
    expect(services[0]).toBeInstanceOf(Service);
    expect(Service).toHaveBeenCalledTimes(1);
    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: serviceDir },
      null,
      null,
      undefined,
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
      ignore: [],
    };

    createServices(config, '/root');

    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      null,
      pkg,
      undefined,
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
      ignore: [],
    };

    createServices(config, '/root');

    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      nextConfig,
      null,
      undefined,
    );
  });

  it('includes the env when creating services', () => {
    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [{ rootDir: '/path/to/service/one' }],
      ignore: [],
    };

    createServices(config, '/root', 'production');

    expect(Service).toHaveBeenCalledWith(
      0,
      { rootDir: '/path/to/service/one' },
      null,
      null,
      'production',
    );
  });

  it('ignores services using the ignore setting', () => {
    const nextConfig = {
      distDir: 'my-next-service/dist',
    };

    mockGetNextConfig.mockReturnValue(nextConfig);

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [
        { rootDir: '/path/to/one/service-one' },
        { rootDir: '/path/to/two/service-two' },
      ],
      ignore: ['path/to/one', 'service-two'],
    };

    const result = createServices(config, '/root');

    expect(result).toEqual([]);
    expect(Service).not.toHaveBeenCalled();
  });
});
