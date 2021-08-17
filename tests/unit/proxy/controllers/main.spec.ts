import HttpProxy from 'http-proxy';
import { mocked } from 'ts-jest/utils';
import httpMocks from 'node-mocks-http';
import { Service } from '../../../../src/services/service';
import { getMainRequestHandler } from '../../../../src/proxy/controllers';
import { Router } from '../../../../src/router';

jest.mock('http-proxy');
jest.mock('../../../../src/router');

const createProxyMock = mocked(HttpProxy.createProxyServer);
const proxyMock = {
  web: jest.fn(),
} as unknown as HttpProxy;

createProxyMock.mockReturnValue(proxyMock);

describe('Proxy: Controllers - Main', () => {
  it('proxies requests to the matched service', () => {
    const router = mocked(new Router([]));

    const handler = getMainRequestHandler({
      router,
      proxy: proxyMock,
      devMode: false,
    });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const service = {
      port: 1234,
    } as Service;

    router.getServiceFromRequest.mockReturnValue(service);
    handler(req, res);

    expect(proxyMock.web).toHaveBeenCalledTimes(1);
    expect(proxyMock.web).toHaveBeenCalledWith(req, res, {
      target: `http://127.0.0.1:${service.port}`,
      autoRewrite: true,
    });
  });

  it('aborts with a 404 if there is no matching service', () => {
    const router = mocked(new Router([]));

    const handler = getMainRequestHandler({
      router,
      proxy: proxyMock,
      devMode: false,
    });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    router.getServiceFromRequest.mockReturnValue(null);

    handler(req, res);

    expect(res._isEndCalled()).toBe(true);
    expect(res._getStatusCode()).toBe(404);
    expect(proxyMock.web).not.toHaveBeenCalled();
  });
});
