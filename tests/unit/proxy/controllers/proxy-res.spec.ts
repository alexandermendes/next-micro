import HttpProxy from 'http-proxy';
import { mocked } from 'ts-jest/utils';
import httpMocks from 'node-mocks-http';
import { Service } from '../../../../src/services';
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
      const router = mocked(new Router([], 3000));

      const handler = getProxyResHandler({
        router,
        proxy: proxyMock,
        devMode: false,
        autostart: false,
      });

      const proxyRes = httpMocks.createRequest();
      const req = httpMocks.createRequest();
      const service = new Service(
        {
          name: 'my-service',
          port: 1234,
          rootDir: '/root',
        },
        null,
        null,
      );

      router.getServiceFromRequest.mockReturnValue(service);
      handler(proxyRes, req);

      expect(proxyRes.headers).toEqual({
        'x-service-name': 'my-service',
        'x-service-port': 1234,
      });
    });

    it('does not modify the headers if no service found', () => {
      const router = mocked(new Router([], 3000));

      const handler = getProxyResHandler({
        router,
        proxy: proxyMock,
        devMode: false,
        autostart: false,
      });

      const proxyRes = httpMocks.createRequest();
      const req = httpMocks.createRequest();

      router.getServiceFromRequest.mockReturnValue(null);
      handler(proxyRes, req);

      expect(proxyRes.headers).toEqual({});
    });
  });
});
