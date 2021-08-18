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
  close: jest.fn((cb) => {
    cb()
  }),
} as unknown as Server;

createServerMock.mockReturnValue(serverMock);

const createProxyMock = mocked(HttpProxy.createProxyServer);
const proxyMock = {
  on: jest.fn(),
} as unknown as HttpProxy;

createProxyMock.mockReturnValue(proxyMock);

describe('Proxy: Server', () => {
  describe('launch', () => {
    it('launches the server with the given port', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);
      const port = 3000;

      await proxyServer.launch(port);

      expect(serverMock.listen).toHaveBeenCalledTimes(1);
      expect(serverMock.listen).toHaveBeenCalledWith(port, '127.0.0.1', expect.any(Function));
    });

    it('initiates graceful shutdown', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);

      await proxyServer.launch(3000);

      expect(gracefulShutdown).toHaveBeenCalledTimes(1);
      expect(gracefulShutdown).toHaveBeenCalledWith(serverMock);
    });

    it('throws if launching the server fails', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);
      const port = 3000;

      const listenSpy = jest.spyOn(serverMock, 'listen');

      listenSpy.mockReturnValueOnce({
        on: jest.fn((evt, cb) => {
          if (evt === 'error') {
            cb(new Error('Bad thing'))
          }
        }),
      } as never);

      let error;

      try {
        await proxyServer.launch(port);
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('Bad thing');
    });
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
        devMode: false,
      });

      expect(createServer).toHaveBeenCalledTimes(1);
      expect(createServer).toHaveBeenCalledWith(mainRequestHandlerMock);
    });

    describe.each`
      scope         | controller
      ${'proxyRes'} | ${mockControllers.getProxyResHandler}
      ${'error'}    | ${mockControllers.getProxyErrorHandler}
    `('proxy on.$scope', ({ scope, controller }) => {
      it('initialises the controller', async () => {
        const router = new Router([]);
        const proxyServer = new ProxyServer(router);
        const port = 3000;
        const handler = jest.fn();

        controller.mockReturnValueOnce(handler);
        await proxyServer.launch(port);

        expect(proxyMock.on).toHaveBeenCalledWith(scope, handler);
        expect(controller).toHaveBeenCalledTimes(1);
        expect(controller).toHaveBeenCalledWith({
          router,
          proxy: proxyMock,
          devMode: false,
        });
      });

      it('initialises the controller in dev mode', async () => {
        const router = new Router([]);
        const proxyServer = new ProxyServer(router, true);
        const port = 3000;
        const handler = jest.fn();

        controller.mockReturnValueOnce(handler);
        await proxyServer.launch(port);

        expect(controller).toHaveBeenCalledTimes(1);
        expect(controller.mock.calls[0][0].devMode).toBe(true);
      });
    });
  });

  describe('close', () => {
    it('closes the server', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);

      await proxyServer.launch(3000);
      await proxyServer.close();

      expect(serverMock.close).toHaveBeenCalledTimes(1);
    });

    it('does nothing if the server is not running', async () => {
      const router = new Router([]);
      const proxyServer = new ProxyServer(router);
      await proxyServer.close();

      expect(serverMock.close).not.toHaveBeenCalled();
    });
  });
});
