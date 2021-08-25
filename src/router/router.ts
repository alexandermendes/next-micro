import getPort from 'get-port';
import { IncomingMessage } from 'http';
import { FSWatcher } from 'chokidar';
import { logger } from '../logger';
import { Service } from '../services';
import { Route } from './route';
import { loadRoutes } from './load-routes';
import { watchNextRoutes } from './watch';

export class Router {
  private services: Service[];
  private routes: Route[];
  private mainPort: number;
  private nextRouteWatcher: FSWatcher | undefined;

  constructor(services: Service[], mainPort: number) {
    this.services = services;
    this.routes = [];
    this.mainPort = mainPort;
  }

  /**
   * Assign ports to any services that have none defined.
   */
  async assignPorts(): Promise<void> {
    const servicePorts = this.services
      .map((service) => service.getPort())
      .filter((x) => x);

    const servicesWithoutPorts = this.services.filter(
      (service) => !service.getPort(),
    );

    const range = Array(100)
      .fill(null)
      .map((__, i) => this.mainPort + 1 + i)
      .filter((port) => !servicePorts.includes(port));

    await Promise.all(
      servicesWithoutPorts.map(async (service) => {
        const port = await getPort({ port: range });

        logger.debug(
          `Auto-assigning port ${port} to service "${service.getName()}"`,
        );

        service.setPort(port);
      }),
    );
  }

  /**
   * Load the routes for all services.
   */
  async loadRoutes(): Promise<void> {
    this.routes = await loadRoutes(this.services);
  }

  /**
   * Watch for potential route changes.
   */
  async watchRoutes(): Promise<void> {
    if (this.nextRouteWatcher) {
      return;
    }

    this.nextRouteWatcher = await watchNextRoutes(
      this.services,
      this.loadRoutes,
    );
  }

  /**
   * Close any route watchers.
   */
  closeWatchers(): void {
    if (!this.nextRouteWatcher) {
      return;
    }

    this.nextRouteWatcher.close();
  }

  /**
   * Get the service that matches an incoming request.
   *
   * If the request URL cannot be matched directly try the referer header. The
   * later could be a subsequent request made by a particular service requesting
   * an internal resource, such as a static asset.
   */
  getServiceFromRequest(req: IncomingMessage): Service | null {
    return (
      this.getServiceFromUrl(req.url) ||
      this.getServiceFromUrl(req.headers?.referer)
    );
  }

  /**
   * Find the service that serves a route matching the given URL.
   *
   * Accepts relative or absolute URLs.
   */
  private getServiceFromUrl = (url: string | undefined): Service | null => {
    if (!url) {
      return null;
    }

    const { pathname } = new URL(url, 'http://temp');
    const matchingRoute = this.routes.find((route) =>
      new RegExp(route.pattern).test(pathname),
    );

    return matchingRoute ? matchingRoute.service : null;
  };
}
