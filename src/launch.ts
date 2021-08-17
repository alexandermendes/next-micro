import { loadConfig } from './config/load';
import { ProxyServer } from './proxy/server';
import { Router } from './router';
import { createServices } from './services/create';

/**
 * Launch the proxy server.
 */
export const launch = async (devMode = false): Promise<ProxyServer> => {
  const config = await loadConfig();
  const services = createServices(config.services);
  const router = new Router(services);
  const server = new ProxyServer(router, devMode);

  return server.launch(config.port);
};
