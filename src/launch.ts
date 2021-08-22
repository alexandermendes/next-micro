import appRoot from 'app-root-path';
import { loadConfig } from './config';
import { ProxyServer } from './proxy/server';
import { Router } from './router';
import { createServices, printServicesTable } from './services';

/**
 * Launch the proxy server.
 */
export const launch = async (devMode = false): Promise<ProxyServer> => {
  const config = await loadConfig();
  const services = createServices(config, appRoot.path);
  const router = new Router(services, config.port);
  const server = new ProxyServer(router, devMode, config.autostart);

  router.loadRoutes();
  await router.assignPorts();
  await server.launch(config.port);
  printServicesTable(services);

  return server;
};
