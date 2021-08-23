import appRoot from 'app-root-path';
import { loadConfig } from './config';
import { logger } from './logger';
import { ProxyServer } from './proxy/server';
import { Router } from './router';
import { createServices, printServicesTable } from './services';

/**
 * Launch the proxy server.
 */
export const launch = async (
  devMode = false,
  serviceNames: string[] = [],
): Promise<ProxyServer> => {
  const config = await loadConfig();
  const services = createServices(config, appRoot.path);
  const router = new Router(services, config.port);
  const server = new ProxyServer(router, devMode, config.autostart);

  await router.loadRoutes();

  if (devMode) {
    router.watchRoutes();
    await router.assignPorts();
  }

  await server.launch(config.port);

  await Promise.all(
    serviceNames.map(async (serviceName) => {
      const service = services.find(
        (service) => service.getName() === serviceName,
      );

      if (!service) {
        logger.warn(`Not a valid service name: ${serviceName}`);
      }

      return service?.launch();
    }),
  );

  printServicesTable(services);

  return server;
};
