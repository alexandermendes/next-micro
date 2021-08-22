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
      const service = {
        name: 'my-service',
        port: 1234,
        launch: jest.fn(() => true),
        refreshTTL: jest.fn(),
        getPort: () => 1000,
        script: '/path/to/script.js',
      } as unknown as Service;

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(false);
      expect(service.launch).toHaveBeenCalledTimes(1);
      expect(service.refreshTTL).toHaveBeenCalledTimes(1);
      expect(proxyMock.web).toHaveBeenCalledTimes(1);
      expect(proxyMock.web).toHaveBeenCalledWith(req, res, {
        target: `http://127.0.0.1:${service.getPort()}`,
        autoRewrite: true,
      });
    });

    it('does not attempt to launch the service if no script', async () => {
      logger.warn = jest.fn();

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
      const service = {
        name: 'my-service',
        port: 1234,
        launch: jest.fn(() => true),
        getPort: () => 1000,
      } as unknown as Service;

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(service.launch).not.toHaveBeenCalled();
      expect(proxyMock.web).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        'Service is not running and cannot be started automatically as no script was defined: my-service',
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
      const service = {
        name: 'my-service',
        port: 1234,
        launch: jest.fn(() => true),
        getPort: () => 1000,
        script: '/path/to/script',
      } as unknown as Service;

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(service.launch).not.toHaveBeenCalled();
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
      const service = {
        name: 'my-service',
        port: 1234,
        launch: jest.fn(() => true),
        getPort: () => 1000,
        script: '/path/to/script',
      } as unknown as Service;

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(service.launch).not.toHaveBeenCalled();
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
      const service = {
        name: 'my-service',
        port: 1234,
        launch: jest.fn(() => false),
        getPort: () => 1000,
        script: '/path/to/script',
      } as unknown as Service;

      err.code = 'ECONNREFUSED';
      router.getServiceFromRequest.mockReturnValue(service);

      await handler(err, req, res);

      expect(res._isEndCalled()).toBe(true);
      expect(service.launch).toHaveBeenCalledTimes(1);
      expect(proxyMock.web).not.toHaveBeenCalled();
    });
  });
});
