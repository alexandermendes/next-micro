import appRoot from 'app-root-path';
import { loadConfig } from './config';
import { logger } from './logger';
import { ProxyServer } from './proxy/server';
import { Router } from './router';
import { createServices } from './services/create';

/**
 * Launch the proxy server.
 */
export const launch = async (devMode = false): Promise<ProxyServer> => {
  const config = await loadConfig();
  const services = createServices(config, appRoot.path);
  const router = new Router(services);
  const server = new ProxyServer(router, devMode, config.autostart);

  router.loadRoutes();
  logger.info(`Services: ${services.length}`);

  return server.launch(config.port);
};
