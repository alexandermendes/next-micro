import httpMocks from 'node-mocks-http';
import glob from 'glob';
import { mocked } from 'ts-jest/utils';
import chokidar, { FSWatcher } from 'chokidar';
import { Router } from '../../../src/router';
import { Service } from '../../../src/services';
import { ServiceConfig } from '../../../src/config';

jest.mock('chokidar');
jest.mock('glob');

const mockChokidar = mocked(chokidar);
const mockGlobSync = mocked(glob.sync);

const createServices = (serviceConfigs: ServiceConfig[]) =>
  serviceConfigs.map((serviceConfig) => new Service(1, serviceConfig, null, null));

describe('Router', () => {
  beforeEach(() => {
    mockGlobSync.mockReturnValue([]);
  });

  it('returns the service that matches an incoming request url', async () => {
    const services = createServices([
      {
        name: 'service-one',
        routes: ['/route/one/.*'],
        rootDir: '/one',
      },
      {
        name: 'service-two',
        routes: ['/route/two/.*'],
        rootDir: '/two',
      },
    ]);

    const router = new Router(services, 3000);
    const req = httpMocks.createRequest({ url: '/route/one/here' });

    await router.loadRoutes();

    const foundService = router.getServiceFromRequest(req);

    expect(foundService).not.toBeNull();
    expect(foundService?.getName()).toBe('service-one');
  });

  it('returns the service that matches an incoming request referer header', async () => {
    const services = createServices([
      {
        name: 'service-one',
        routes: ['/route/one/.*'],
        rootDir: '/one',
      },
      {
        name: 'service-two',
        routes: ['/route/two/.*'],
        rootDir: '/two',
      },
    ]);

    const router = new Router(services, 3000);
    const req = httpMocks.createRequest({
      headers: { referer: '/route/two/here' },
    });

    await router.loadRoutes();

    const foundService = router.getServiceFromRequest(req);

    expect(foundService).not.toBeNull();
    expect(foundService?.getName()).toBe('service-two');
  });

  it('returns null if no service matches a url', async () => {
    const services = createServices([
      {
        name: 'service',
        routes: ['/route'],
        rootDir: '/service',
      },
    ]);

    const req = httpMocks.createRequest({ url: '/unknown' });
    const router = new Router(services, 3000);

    await router.loadRoutes();

    const foundService = router.getServiceFromRequest(req);

    expect(foundService).toBeNull();
  });

  it('returns null if the routes have not been loaded', () => {
    const services = createServices([
      {
        name: 'service',
        routes: ['/route'],
        rootDir: '/service',
      },
    ]);

    const req = httpMocks.createRequest({ url: '/route' });
    const router = new Router(services, 3000);

    const foundService = router.getServiceFromRequest(req);

    expect(foundService).toBeNull();
  });

  it('assigns ports to services that have none', async () => {
    const services = createServices([
      {
        name: 'service-one',
        port: 3001,
        rootDir: '/one',
      },
      {
        name: 'service-two',
        rootDir: '/two',
      },
    ]);

    const router = new Router(services, 3000);

    await router.assignPorts();

    expect(services[0].getPort()).toBe(3001);
    expect(services[1].getPort()).toBe(3002);
  });

  it('watches for route changes', () => {
    const services = createServices([
      {
        name: 'service-one',
        port: 3001,
        rootDir: '/one',
      },
      {
        name: 'service-two',
        rootDir: '/two',
      },
    ]);

    const router = new Router(services, 3000);
    const mockOn = jest.fn();

    const loadRoutesSpy = jest.spyOn(router, 'loadRoutes').mockResolvedValue();

    mockChokidar.watch.mockReturnValue({
      on: mockOn,
    } as unknown as FSWatcher);

    router.watchRoutes();

    const [mockOnEvt, mockOnCb] = mockOn.mock.calls[0];

    mockOnCb();

    expect(mockOnEvt).toBe('all');
    expect(loadRoutesSpy).toHaveBeenCalledTimes(1);
    expect(mockChokidar.watch).toHaveBeenCalledTimes(1);
    expect(mockChokidar.watch).toHaveBeenCalledWith(['/one', '/two'], {
      ignoreInitial: true,
      ignored: /(^|[/\\])\../,
    });
  });
});
