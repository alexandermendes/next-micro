import httpMocks from 'node-mocks-http';
import { mocked } from 'ts-jest/utils';
import { Router } from '../../../src/router';
import { watchNextRoutes } from '../../../src/router/watch';
import { Service } from '../../../src/services';
import { ServiceConfig } from '../../../src/config';

jest.mock('../../../src/router/watch');

const mockWatchNextRoutes = mocked(watchNextRoutes);

const createServices = (serviceConfigs: ServiceConfig[]) =>
  serviceConfigs.map(
    (serviceConfig) => new Service(1, serviceConfig, null, null),
  );

describe('Router', () => {
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

  it('watches for Next.js route changes', async () => {
    const services = createServices([
      {
        name: 'service-one',
        rootDir: '/one',
      },
    ]);

    const router = new Router(services, 3000);
    const loadRoutesSpy = jest.spyOn(router, 'loadRoutes').mockResolvedValue();

    await router.watchRoutes();

    const [, mockCb] = mockWatchNextRoutes.mock.calls[0];

    mockCb();

    expect(mockWatchNextRoutes).toHaveBeenCalledTimes(1);
    expect(mockWatchNextRoutes).toHaveBeenCalledWith(
      services,
      expect.any(Function),
    );
    expect(loadRoutesSpy).toHaveBeenCalledTimes(1);
  });
});
