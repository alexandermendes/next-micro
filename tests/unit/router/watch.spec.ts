import glob from 'glob';
import { mocked } from 'ts-jest/utils';
import chokidar, { FSWatcher } from 'chokidar';
import { watchNextRoutes } from '../../../src/router/watch';
import { Service } from '../../../src/services';
import { ServiceConfig } from '../../../src/config';

jest.mock('chokidar');
jest.mock('glob');

const mockChokidar = mocked(chokidar);
const mockGlobSync = mocked(glob.sync);

const createServices = (serviceConfigs: ServiceConfig[]) =>
  serviceConfigs.map(
    (serviceConfig) => new Service(1, serviceConfig, null, null),
  );

const mockOn = jest.fn();
const callback = jest.fn();

mockChokidar.watch.mockReturnValue({
  on: mockOn,
} as unknown as FSWatcher);

describe('Router: Watch', () => {
  beforeEach(() => {
    mockGlobSync.mockReturnValue([]);
  });

  it('sets up the watcher', async () => {
    const services = createServices([
      {
        name: 'service-one',
        rootDir: '/service-one',
      },
      {
        name: 'service-two',
        rootDir: '/service-two',
      },
    ]);

    mockGlobSync.mockReturnValueOnce(['/pages']);
    mockGlobSync.mockReturnValueOnce(['/src/pages']);

    await watchNextRoutes(services, callback);

    const [mockOnEvt] = mockOn.mock.calls[0];

    expect(mockGlobSync).toHaveBeenCalledTimes(2);
    expect(mockGlobSync).toHaveBeenCalledWith('{src/,}pages/', {
      cwd: '/service-one',
    });

    expect(mockGlobSync).toHaveBeenCalledWith('{src/,}pages/', {
      cwd: '/service-two',
    });

    expect(mockOnEvt).toBe('all');
    expect(mockChokidar.watch).toHaveBeenCalledTimes(1);
    expect(mockChokidar.watch).toHaveBeenCalledWith(['/pages', '/src/pages'], {
      ignoreInitial: true,
      ignored: /(^|[/\\])\../,
    });
  });

  it('responds to route changes', async () => {
    const services = createServices([
      {
        name: 'service-one',
        rootDir: '/pages',
      },
      {
        name: 'service-two',
        rootDir: '/src/pages',
      },
    ]);

    mockGlobSync.mockReturnValueOnce(['/pages']);
    mockGlobSync.mockReturnValueOnce(['/src/pages']);

    await watchNextRoutes(services, callback);

    const [, mockOnCb] = mockOn.mock.calls[0];

    mockOnCb('changed', '/pages/my-page');

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
