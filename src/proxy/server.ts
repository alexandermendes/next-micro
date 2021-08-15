import http from 'http';
import gracefulShutdown from 'http-graceful-shutdown';
import HttpProxy from 'http-proxy';
import { Router } from '../router';
import {
  ControllerContext,
  getMainRequestHandler,
  getProxyResHandler,
} from './controllers';

export class ProxyServer {
  private router: Router;
  private proxy: HttpProxy;
  private server: http.Server | null;

  constructor(router: Router) {
    this.router = router;
    this.proxy = HttpProxy.createProxyServer();
    this.server = null;
  }

  async launch(port: number): Promise<ProxyServer> {
    const controllerContext: ControllerContext = {
      router: this.router,
      proxy: this.proxy,
    };

    this.server = http.createServer(getMainRequestHandler(controllerContext));
    const host = '127.0.0.1';

    // proxy.on('error', getProxyErrorHandler(routes, serviceConfigs));
    this.proxy.on('proxyRes', getProxyResHandler(controllerContext));
    // server.on('close', getShutdownHandler(proxy, watcher));

    gracefulShutdown(this.server);

    await new Promise((resolve, reject) => {
      this.server?.listen(port, host, resolve as () => void).on('error', reject);
    });

    return this;
  }

  async close(): Promise<void> {
    if (!this.server) {
      return;
    }

    await new Promise((resolve) => {
      this.server?.close(resolve as () => void)
    });

    this.server = null;
  }
}
