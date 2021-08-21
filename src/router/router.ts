import { IncomingMessage } from 'http';
import { Service } from '../services/service';

type Route = {
  readonly pattern: string | RegExp;
  readonly service: Service;
};

export class Router {
  private services: Service[];
  private routes: Route[];

  constructor(services: Service[]) {
    this.services = services;
    this.routes = [];
  }

  loadRoutes(): void {
    this.routes = [];

    this.services.forEach((service) => {
      this.routes.push(...this.getRoutesForService(service));
    });
  }

  private getRoutesForService(service: Service): Route[] {
    const routes: Route[] = service.routes.map((pattern) => <Route>{
      pattern,
      service,
    });

    return routes;
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
}
