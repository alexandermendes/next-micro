import { createServer, Server } from 'http';
import HttpProxy from 'http-proxy';
import gracefulShutdown from 'http-graceful-shutdown';
import { mocked } from 'ts-jest/utils';
import { ProxyServer } from '../../../src/proxy/server';
import { Router } from '../../../src/router';
import * as controllers from '../../../src/proxy/controllers'

jest.mock('http');
jest.mock('http-proxy');
jest.mock('http-graceful-shutdown');
jest.mock('../../../src/router');
jest.mock('../../../src/proxy/controllers');

const mockControllers = mocked(controllers);

const createServerMock = mocked(createServer);
const serverMock = {
  listen: jest.fn((host, port, cb) => {
    cb();
  }),
} as unknown as Server;

createServerMock.mockReturnValue(serverMock);

const createProxyMock = mocked(HttpProxy.createProxyServer);
const proxyMock = {
  on: jest.fn(),
} as unknown as HttpProxy;

createProxyMock.mockReturnValue(proxyMock);

describe('Proxy: Server', () => {
  it('launches the server with the given port', async () => {
    const router = new Router([]);
    const proxyServer = new ProxyServer(router);
    const port = 3000;

    await proxyServer.launch(port);

    expect(serverMock.listen).toHaveBeenCalledTimes(1);
    expect(serverMock.listen).toHaveBeenCalledWith('http://127.0.0.1', port, expect.any(Function));
  });

  it('initiates graceful shutdown', async () => {
    const router = new Router([]);
    const proxyServer = new ProxyServer(router);

    await proxyServer.launch(3000);

    expect(gracefulShutdown).toHaveBeenCalledTimes(1);
    expect(gracefulShutdown).toHaveBeenCalledWith(serverMock);
  });

  describe('controllers', () => {
    it('initialises the main request handler', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);
      const port = 3000;
      const mainRequestHandlerMock = jest.fn();

      mockControllers.getMainRequestHandler.mockReturnValueOnce(mainRequestHandlerMock);
      await proxyServer.launch(port);

      expect(mockControllers.getMainRequestHandler).toHaveBeenCalledTimes(1);
      expect(mockControllers.getMainRequestHandler).toHaveBeenCalledWith({
        router,
        proxy: proxyMock,
      });

      expect(createServer).toHaveBeenCalledTimes(1);
      expect(createServer).toHaveBeenCalledWith(mainRequestHandlerMock);
    });

    it('initialises the proxy res handler', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);
      const port = 3000;
      const proxyResHandlerMock = jest.fn();

      mockControllers.getProxyResHandler.mockReturnValueOnce(proxyResHandlerMock);
      await proxyServer.launch(port);

      expect(mockControllers.getProxyResHandler).toHaveBeenCalledTimes(1);
      expect(mockControllers.getProxyResHandler).toHaveBeenCalledWith({
        router,
        proxy: proxyMock,
      });

      expect(proxyMock.on).toHaveBeenCalledWith('proxyRes', proxyResHandlerMock)
    });
  });
});
