import fs from 'fs';
import glob from 'glob';
import { mocked } from 'ts-jest/utils';
import { ConcreteNextMicroConfig } from '../../../src/config';
import { createServices } from '../../../src/services/create';
import { Service } from '../../../src/services/service';

jest.mock('fs');
jest.mock('glob');
jest.mock('../../../src/services/service');

const mockFs = mocked(fs);
const mockGlobSync = mocked(glob.sync);
const MockService = mocked(Service);

describe('Services: Create', () => {
  beforeEach(() => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('No file here');
    });

    mockGlobSync.mockReturnValue([]);
  });

  it('creates a service based on the root dir alone', () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'my-service' }));

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [
        {
          rootDir: '/path/to/service',
        },
      ],
    };

    const services = createServices(config, '/root');

    expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      '/path/to/service/package.json',
    );
    expect(services).toHaveLength(1);
    expect(services[0]).toBeInstanceOf(Service);
    expect(Service).toHaveBeenCalledTimes(1);
    expect(Service).toHaveBeenCalledWith({
      name: 'my-service',
      rootDir: '/path/to/service',
    });
  });

  it('creates a service with specified overrides', () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'my-service' }));

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [
        {
          name: 'service-one',
          port: 1234,
          rootDir: '/path/to/service',
        },
      ],
    };

    createServices(config, '/root');

    expect(MockService.mock.calls[0][0]).toMatchObject({
      name: 'service-one',
      port: 1234,
    });
  });

  it('autoloads Next.js services', () => {
    mockGlobSync.mockReturnValue([
      '/one/next.config.js',
      '/two/next.config.js',
    ]);

    mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'my-service' }));

    const config: ConcreteNextMicroConfig = {
      port: 3000,
      autoload: true,
      autostart: true,
      services: [],
    };

    const services = createServices(config, '/root');

    expect(services).toHaveLength(2);
    expect(Service).toHaveBeenCalledTimes(2);
    expect(Service).toHaveBeenCalledWith({
      name: 'my-service',
      rootDir: '/one',
      port: 123,
    });

    expect(Service).toHaveBeenCalledWith({
      name: 'my-service',
      rootDir: '/two',
      port: 123,
    });
  });
});
