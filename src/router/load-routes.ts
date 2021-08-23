import path from 'path';
import glob from 'glob';
import { pathToRegexp } from 'path-to-regexp';
import {
  getRouteRegex,
  getSortedRoutes,
} from 'next/dist/shared/lib/router/utils';
import { Service } from '../services';
import { createRoute, Route } from './route';
import { logger } from '../logger';

type NextRewrite = {
  source: string;
  destination: string;
};

const SUPPORTED_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];

/**
 * Filter out any non-supported extensions.
 */
const filterSupportedExtensions = (filePath: string): boolean => {
  const ext = path.extname(filePath);

  return SUPPORTED_EXTENSIONS.includes(ext.replace(/^\./, ''));
};

/**
 * Filter out any internal Next.js pages (e.g. _document.js).
 */
const filterNonInternalPages = (filePath: string): boolean => {
  return !filePath.match(/^\/_/);
};

/**
 * Filter Next.js services.
 */
const filterNextService = (service: Service): boolean =>
  !!service.getNextConfig();

/**
 * Convert a file path to a Next.js page path.
 */
const getNextPageKey = (filePath: string): string => {
  const page = filePath
    .replace(/^(src\/)?pages/, '')
    .replace(new RegExp(`\\.+(${SUPPORTED_EXTENSIONS.join('|')})$`), '')
    .replace(/\\/g, '/')
    .replace(/\/index$/, '');

  return page === '' ? '/' : page;
};

/**
 * Get the the file paths from the pages dir of a Next service.
 *
 * Next supports /pages and /src/pages. We currently use the latter but still
 * check both.
 */
const getNextPages = (cwd: string): string[] => {
  const files = glob.sync('{src/,}pages/**/*.{j,t}s{,x}', { cwd });
  const supportedFiles = files.filter(filterSupportedExtensions);
  const pageKeys = supportedFiles.map(getNextPageKey);

  return pageKeys.filter(filterNonInternalPages);
};

/**
 * Get the routes for all next services.
 *
 * Services may contain conflicting routes. For example, Service A might serve
 * pages from `/user/[userId]/recipe/[slug]` while Service B serves pages
 * from `/user/[userId]/recipe/create`.
 *
 * Next.js normally handles this by sorting the routes, preferring the more
 * specific `/create` segement over the `/[slug]` wildcard. However, as we
 * don't have a single Next application we have to work around this by pulling
 * the page files from all services together, sorting those (using the Next.js
 * algorithm) before mapping the associated regex pattern for each route against
 * the service. This does mean we rely on importing from a dist folder of Next,
 * which isn't ideal. But this is probably better than rewriting the Next route
 * matching algorithm, or having to maintain some complex list of regex pattens
 * and modifying that list every time we a route changes locally. It seems very
 * unlikely that the Next.js route matching algorithm will change, however,
 * they may move these functions, at which point we will soon notice and should
 * update this route finding function accordingly.
 */
const getNextRoutes = (services: Service[]): Route[] => {
  const nextServices = services.filter(filterNextService);
  console.log(nextServices);

  const nextPages = nextServices.reduce(
    (acc: Record<string, Service>, service) => {
      const pageKeys = getNextPages(service.getRootDir());

      // Map page keys to services so we can sort them together before
      // creating the routes for each service.
      pageKeys.forEach((pageKey: string) => {
        if (pageKey in acc) {
          throw new Error(
            `The "${pageKey}" route has been defined multiple times. ` +
              'Please check the pages directories of your Next.js services.',
          );
        }

        acc[pageKey] = service;
      });

      return acc;
    },
    {},
  );

  let sortedPages;

  try {
    sortedPages = getSortedRoutes(Object.keys(nextPages));
  } catch (err) {
    throw new Error(
      'The following error occurred while sorting the routes ' +
        `for the Next services, please check the "pages/" directories: ${err.message}`,
    );
  }

  return sortedPages.map((page) =>
    createRoute(
      getRouteRegex(page).re.source.replace(/\\\//g, '/'),
      nextPages[page],
    ),
  );
};

/**
 * Get any Next.js rewrites associated with the service.
 */
const getNextRewrites = async (service: Service): Promise<Route[]> => {
  const nextConfig = service.getNextConfig();

  if (!nextConfig) {
    return [];
  }

  const { rewrites } = nextConfig;

  if (typeof rewrites !== 'function') {
    return [];
  }

  const rewritesResult = await rewrites();

  if (!Array.isArray(rewritesResult)) {
    return [];
  }

  // Append custom Next.js rewrites
  const routes: Route[] = [];

  rewritesResult.forEach(({ source }: NextRewrite) => {
    try {
      routes.push(
        createRoute(
          pathToRegexp(source, [], {
            strict: true,
            sensitive: false,
            delimiter: '/',
          }).source,
          service,
        ),
      );
    } catch (err) {
      logger.warn(`Invalid Next.js rewrite detected with source "${source}"`);
    }
  });

  return routes;
};

/**
 * Get the routes for a service.
 */
const getRoutesForService = (service: Service): Route[] => {
  const routes: Route[] = service
    .getRoutes()
    .map((pattern) => createRoute(pattern, service));

  return routes;
};

/**
 * Load the routes for all services.
 */
export const loadRoutes = async (services: Service[]): Promise<Route[]> => {
  const routes = getNextRoutes(services);

  // Append any custom routes.
  services.forEach((service) => {
    routes.push(...getRoutesForService(service));
  });

  // Append any Next.js rewrites.
  await Promise.all(
    services.filter(filterNextService).map(async (service) => {
      routes.push(...(await getNextRewrites(service)));
    }),
  );

  return routes;
};
