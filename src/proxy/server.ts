import http from 'http';
import gracefulShutdown from 'http-graceful-shutdown';
import HttpProxy from 'http-proxy';
import { logger } from '../logger';
import { Router } from '../router';
import {
  ControllerContext,
  getMainRequestHandler,
  getProxyResHandler,
  getProxyErrorHandler,
} from './controllers';

export class ProxyServer {
  private router: Router;
  private proxy: HttpProxy;
  private server: http.Server | null;
  private devMode: boolean;

  constructor(router: Router, devMode = false) {
    this.router = router;
    this.proxy = HttpProxy.createProxyServer();
    this.server = null;
    this.devMode = devMode;
  }

  async launch(port: number): Promise<ProxyServer> {
    const controllerContext: ControllerContext = {
      router: this.router,
      proxy: this.proxy,
      devMode: this.devMode,
    };

    this.server = http.createServer(getMainRequestHandler(controllerContext));
    const host = '127.0.0.1';

    this.proxy.on('error', getProxyErrorHandler(controllerContext));
    this.proxy.on('proxyRes', getProxyResHandler(controllerContext));
    // server.on('close', getShutdownHandler(proxy, watcher));

    gracefulShutdown(this.server);

    await new Promise((resolve, reject) => {
      this.server
        ?.listen(port, host, resolve as () => void)
        .on('error', reject);
    });

    logger.success(`Server listening on http://${host}:${port}`);

    return this;
  }

  async close(): Promise<void> {
    if (!this.server) {
      return;
    }

    await new Promise((resolve) => {
      this.server?.close(resolve as () => void);
    });

    this.server = null;
  }
}
