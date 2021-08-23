import HttpProxy from 'http-proxy';
import { mocked } from 'ts-jest/utils';
import httpMocks from 'node-mocks-http';
import { Service } from '../../../../src/services';
import { getProxyErrorHandler } from '../../../../src/proxy/controllers';
import { Router } from '../../../../src/router';
import { logger } from '../../../../src/logger';

jest.mock('http-proxy');
jest.mock('../../../../src/router');

const createProxyMock = mocked(HttpProxy.createProxyServer);
const proxyMock = {
  web: jest.fn(),
} as unknown as HttpProxy;

createProxyMock.mockReturnValue(proxyMock);

const originalLoggerWarn = logger.warn;

describe('Proxy: Controllers - Proxy Error', () => {
  afterEach(() => {
    logger.warn = originalLoggerWarn;
  });

  it('aborts with a 404 if there is no matching service', () => {
    const router = mocked(new Router([], 3000));

    const handler = getProxyErrorHandler({
      router,
      proxy: proxyMock,
      devMode: true,
      autostart: true,
    });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const err = new Error() as NodeJS.ErrnoException;

    router.getServiceFromRequest.mockReturnValue(null);

    handler(err, req, res);

    expect(res._isEndCalled()).toBe(true);
    expect(res._getStatusCode()).toBe(404);
    expect(proxyMock.web).not.toHaveBeenCalled();
  });

  describe('launch', () => {
    it('launches and redirects to the service on ECONNREFUSED', async () => {
      const router = mocked(new Router([], 3000));

      const handler = getProxyErrorHandler({
        router,
        proxy: proxyMock,
        devMode: true,
        autostart: true,
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const err = new Error() as NodeJS.ErrnoException;
      const service = new Service(
        {
          name: 'my-service',
          script: 'script.js',
          rootDir: '/service',
        },
        null,
        null,
      );

      const launchSpy = jest.spyOn(service, 'launch');
      const refreshTTLSpy = jest.spyOn(service, 'refreshTTL');

      launchSpy.mockResolvedValue(true);

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(false);
      expect(launchSpy).toHaveBeenCalledTimes(1);
      expect(refreshTTLSpy).toHaveBeenCalledTimes(1);
      expect(proxyMock.web).toHaveBeenCalledTimes(1);
      expect(proxyMock.web).toHaveBeenCalledWith(req, res, {
        target: `http://127.0.0.1:${service.getPort()}`,
        autoRewrite: true,
      });
    });

    it('does not attempt to launch the service if no script', async () => {
      logger.error = jest.fn();

      const router = mocked(new Router([], 3000));

      const handler = getProxyErrorHandler({
        router,
        proxy: proxyMock,
        devMode: true,
        autostart: true,
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const err = new Error() as NodeJS.ErrnoException;
      const service = new Service(
        {
          name: 'my-service',
          rootDir: '/service',
        },
        null,
        null,
      );

      const launchSpy = jest.spyOn(service, 'launch');

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(launchSpy).toHaveBeenCalled();
      expect(proxyMock.web).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        new Error(
          'Service has no startup script and is not a Next.js service: my-service',
        ),
      );
    });

    it('does not attempt to launch the service if not in dev mode', async () => {
      const router = mocked(new Router([], 3000));

      const handler = getProxyErrorHandler({
        router,
        proxy: proxyMock,
        devMode: false,
        autostart: true,
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const err = new Error() as NodeJS.ErrnoException;
      const service = new Service(
        {
          name: 'my-service',
          script: 'script.js',
          rootDir: '/service',
        },
        null,
        null,
      );

      const launchSpy = jest.spyOn(service, 'launch');

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(launchSpy).not.toHaveBeenCalled();
      expect(proxyMock.web).not.toHaveBeenCalled();
    });

    it('does not attempt to launch the service if not in automock mode', async () => {
      const router = mocked(new Router([], 3000));

      const handler = getProxyErrorHandler({
        router,
        proxy: proxyMock,
        devMode: true,
        autostart: false,
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const err = new Error() as NodeJS.ErrnoException;
      const service = new Service(
        {
          name: 'my-service',
          script: 'script.js',
          rootDir: '/service',
        },
        null,
        null,
      );

      const launchSpy = jest.spyOn(service, 'launch');

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(launchSpy).not.toHaveBeenCalled();
      expect(proxyMock.web).not.toHaveBeenCalled();
    });

    it('does not redirect via the proxy if the launch failed', async () => {
      const router = mocked(new Router([], 3000));

      const handler = getProxyErrorHandler({
        router,
        proxy: proxyMock,
        devMode: true,
        autostart: true,
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const err = new Error() as NodeJS.ErrnoException;
      const service = new Service(
        {
          name: 'my-service',
          script: 'script.js',
          rootDir: '/service',
        },
        null,
        null,
      );

      const launchSpy = jest.spyOn(service, 'launch');

      launchSpy.mockResolvedValue(false);
      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(launchSpy).toHaveBeenCalledTimes(1);
      expect(proxyMock.web).not.toHaveBeenCalled();
    });
  });
});
