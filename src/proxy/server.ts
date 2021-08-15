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
  readonly router: Router;
  private proxy: HttpProxy;

  constructor(router: Router) {
    this.router = router;
    this.proxy = HttpProxy.createProxyServer();
  }

  launch(port: number): Promise<http.Server> {
    const controllerContext: ControllerContext = {
      router: this.router,
      proxy: this.proxy,
    };

    const server = http.createServer(getMainRequestHandler(controllerContext));
    const host = 'http://127.0.0.1';

    // proxy.on('error', getProxyErrorHandler(routes, serviceConfigs));
    this.proxy.on('proxyRes', getProxyResHandler(controllerContext));
    // server.on('close', getShutdownHandler(proxy, watcher));

    gracefulShutdown(server);

    return new Promise((resolve) => {
      server.listen(host, port, resolve as () => void);
    });
  }
}
