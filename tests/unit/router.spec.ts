import { IncomingMessage } from 'http';
import { Router } from '../../src/router';
import { Service, ServiceConfig } from '../../src/services/service';

describe('Router', () => {
  it('returns the service that matches an incoming request url', () => {
    const serviceOne = new Service({
      name: 'service-one',
      routes: ['/route/one/.*'],
    } as ServiceConfig);

    const serviceTwo = new Service({
      name: 'service-two',
      routes: ['/route/two/.*'],
    } as ServiceConfig);

    const req = { url: '/route/one/here' } as IncomingMessage;
    const router = new Router([serviceOne, serviceTwo]);
    const foundService = router.getServiceFromRequest(req);

    expect(foundService).not.toBeNull();
    expect(foundService?.name).toBe('service-one');
  });

  it('returns the service that matches an incoming request referer header', () => {
    const serviceOne = new Service({
      name: 'service-one',
      routes: ['/route/one/.*'],
    } as ServiceConfig);

    const serviceTwo = new Service({
      name: 'service-two',
      routes: ['/route/two/.*'],
    } as ServiceConfig);

    const req = { headers: { referer: '/route/two/here' } } as IncomingMessage;
    const router = new Router([serviceOne, serviceTwo]);
    const foundService = router.getServiceFromRequest(req);

    expect(foundService).not.toBeNull();
    expect(foundService?.name).toBe('service-two');
  });

  it('returns null if no service matches a url', () => {
    const service = new Service({
      name: 'service-one',
      routes: ['/route'],
    } as ServiceConfig);

    const req = { url: '/unknown' } as IncomingMessage;
    const router = new Router([service]);
    const foundService = router.getServiceFromRequest(req);

    expect(foundService).toBeNull();
  });
});
