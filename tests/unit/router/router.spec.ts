import httpMocks from 'node-mocks-http';
import { Router } from '../../../src/router';
import { Service } from '../../../src/services';
import { ServiceConfig } from '../../../src/config';

const createServices = (serviceConfigs: ServiceConfig[]) =>
  serviceConfigs.map((serviceConfig) => new Service(serviceConfig));

describe('Router', () => {
  it('returns the service that matches an incoming request url', () => {
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

    router.loadRoutes();

    const foundService = router.getServiceFromRequest(req);

    expect(foundService).not.toBeNull();
    expect(foundService?.name).toBe('service-one');
  });

  it('returns the service that matches an incoming request referer header', () => {
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

    router.loadRoutes();

    const foundService = router.getServiceFromRequest(req);

    expect(foundService).not.toBeNull();
    expect(foundService?.name).toBe('service-two');
  });

  it('returns null if no service matches a url', () => {
    const services = createServices([
      {
        name: 'service',
        routes: ['/route'],
        rootDir: '/service',
      },
    ]);

    const req = httpMocks.createRequest({ url: '/unknown' });
    const router = new Router(services, 3000);

    router.loadRoutes();

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
});
