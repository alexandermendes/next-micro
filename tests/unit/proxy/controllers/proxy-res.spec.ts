import HttpProxy from 'http-proxy';
import { mocked } from 'ts-jest/utils';
import httpMocks from 'node-mocks-http';
import { Service } from '../../../../src/services/service';
import { getProxyResHandler } from '../../../../src/proxy/controllers';
import { Router } from '../../../../src/router';

jest.mock('http-proxy');
jest.mock('../../../../src/router');

const createProxyMock = mocked(HttpProxy.createProxyServer);
const proxyMock = {
  web: jest.fn(),
} as unknown as HttpProxy;

createProxyMock.mockReturnValue(proxyMock);

describe('Proxy: Controllers - Proxy Res', () => {
  describe('headers', () => {
    it('appends the expected headers', () => {
      const router = mocked(new Router([]));

      const handler = getProxyResHandler({
        router,
        proxy: proxyMock,
        devMode: false,
      });

      const proxyRes = httpMocks.createRequest();
      const req = httpMocks.createRequest();
      const service = {
        name: 'my-service',
        port: 1234,
      } as Service;

      router.getServiceFromRequest.mockReturnValue(service);
      handler(proxyRes, req);

      expect(proxyRes.headers).toEqual({
        'x-service-name': service.name,
        'x-service-port': service.port,
      });
    });

    it('does not modify the headers if no service found', () => {
      const router = mocked(new Router([]));

      const handler = getProxyResHandler({
        router,
        proxy: proxyMock,
        devMode: false,
      });

      const proxyRes = httpMocks.createRequest();
      const req = httpMocks.createRequest();

      router.getServiceFromRequest.mockReturnValue(null);
      handler(proxyRes, req);

      expect(proxyRes.headers).toEqual({});
    });
  });
});
