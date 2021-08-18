import HttpProxy from 'http-proxy';
import { mocked } from 'ts-jest/utils';
import httpMocks from 'node-mocks-http';
import { Service } from '../../../../src/services/service';
import { getProxyErrorHandler } from '../../../../src/proxy/controllers';
import { Router } from '../../../../src/router';

jest.mock('http-proxy');
jest.mock('../../../../src/router');

const createProxyMock = mocked(HttpProxy.createProxyServer);
const proxyMock = {
  web: jest.fn(),
} as unknown as HttpProxy;

createProxyMock.mockReturnValue(proxyMock);

describe('Proxy: Controllers - Proxy Error', () => {
  it('aborts with a 404 if there is no matching service', () => {
    const router = mocked(new Router([]));

    const handler = getProxyErrorHandler({
      router,
      proxy: proxyMock,
      devMode: false,
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

  it('launches and redirects to the service on ECONNREFUSED', async () => {
    const router = mocked(new Router([]));

    const handler = getProxyErrorHandler({
      router,
      proxy: proxyMock,
      devMode: false,
    });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const err = new Error() as NodeJS.ErrnoException;
    const service = {
      port: 1234,
      launch: jest.fn(),
    } as unknown as Service;

    err.code = 'ECONNREFUSED';
    router.getServiceFromRequest.mockReturnValue(service);

    await handler(err, req, res);

    expect(res._isEndCalled()).toBe(false);
    expect(service.launch).toHaveBeenCalledTimes(1);
    expect(proxyMock.web).toHaveBeenCalledTimes(1);
    expect(proxyMock.web).toHaveBeenCalledWith(req, res, {
      target: `http://127.0.0.1:${service.port}`,
      autoRewrite: true,
    });
  });
});
