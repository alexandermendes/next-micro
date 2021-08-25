import glob from 'glob';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../src/logger';
import { loadRoutes } from '../../../src/router/load-routes';
import { Route } from '../../../src/router/route';
import { Service } from '../../../src/services';

jest.mock('glob');

const mockGlobSync = mocked(glob.sync);

const simplifyRoutes = (routes: Route[]) =>
  routes.map(({ pattern, service }) => ({
    pattern,
    service: service.getName(),
  }));

const originalLoggerWarn = logger.warn;

describe('Router: Load routes', () => {
  beforeEach(() => {
    mockGlobSync.mockReturnValue([]);
  });

  afterEach(() => {
    logger.warn = originalLoggerWarn;
  });

  describe('next routes', () => {
    it.each(['js', 'jsx', 'ts', 'tsx'])('includes %s files', async (ext) => {
      mockGlobSync.mockReturnValue([
        `src/pages/index.${ext}`,
        `src/pages/thing.${ext}`,
        `src/pages/stuff/index.${ext}`,
        `src/pages/stuff/[id].${ext}`,
      ]);

      const nextConfig = {};
      const service = new Service(
        1,
        {
          name: 'my-service',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const routes = await loadRoutes([service]);
      const globPattern = '{src/,}pages/**/*.{j,t}s{,x}';

      expect(mockGlobSync).toHaveBeenCalledTimes(1);
      expect(mockGlobSync).toHaveBeenCalledWith(globPattern, {
        cwd: '/path/to/service',
      });
      expect(simplifyRoutes(routes)).toEqual([
        {
          pattern: '^/(?:/)?$',
          service: 'my-service',
        },
        {
          pattern: '^/stuff(?:/)?$',
          service: 'my-service',
        },
        {
          pattern: '^/stuff/([^/]+?)(?:/)?$',
          service: 'my-service',
        },
        {
          pattern: '^/thing(?:/)?$',
          service: 'my-service',
        },
      ]);
    });

    it('filters out internal pages', async () => {
      mockGlobSync.mockReturnValue([
        'src/pages/_app.js',
        'src/pages/_document.js',
        'src/pages/_error.js',
      ]);

      const nextConfig = {};
      const service = new Service(
        1,
        {
          name: 'my-service',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const routes = await loadRoutes([service]);

      expect(routes).toEqual([]);
    });

    it('sorts routes from multiple services', async () => {
      mockGlobSync.mockReturnValueOnce([
        'src/pages/index.js',
        'src/pages/stuff/index.js',
      ]);

      mockGlobSync.mockReturnValueOnce(['src/pages/stuff/specific.js']);

      mockGlobSync.mockReturnValueOnce(['src/pages/stuff/[id].js']);

      const nextConfig = {};
      const serviceOne = new Service(
        1,
        {
          name: 'service-one',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const serviceTwo = new Service(
        1,
        {
          name: 'service-two',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const serviceThree = new Service(
        1,
        {
          name: 'service-three',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const routes = await loadRoutes([serviceOne, serviceTwo, serviceThree]);

      expect(simplifyRoutes(routes)).toEqual([
        {
          pattern: '^/(?:/)?$',
          service: 'service-one',
        },
        {
          pattern: '^/stuff(?:/)?$',
          service: 'service-one',
        },
        {
          pattern: '^/stuff/specific(?:/)?$',
          service: 'service-two',
        },
        {
          pattern: '^/stuff/([^/]+?)(?:/)?$',
          service: 'service-three',
        },
      ]);
    });

    it('throws if two services contain the same route', async () => {
      mockGlobSync.mockReturnValue(['src/pages/index.js']);

      const nextConfig = {};
      const serviceOne = new Service(
        1,
        {
          name: 'service-one',
          rootDir: '/path/to/service-one',
        },
        nextConfig,
        null,
      );

      const serviceTwo = new Service(
        1,
        {
          name: 'service-two',
          rootDir: '/path/to/service-two',
        },
        nextConfig,
        null,
      );

      await expect(async () =>
        loadRoutes([serviceOne, serviceTwo]),
      ).rejects.toThrow(
        `The "/" route has been defined multiple times, ` +
          `in both /path/to/service-one and /path/to/service-two. ` +
          'Please check the pages directories of your Next.js services.',
      );
    });
  });

  describe('next rewrites', () => {
    it('appends next rewrites', async () => {
      mockGlobSync.mockReturnValue(['src/pages/index.js']);

      const nextConfig = {
        async rewrites() {
          return [
            {
              source: '/about',
              destination: '/',
            },
            {
              source: '/about/:any*',
              destination: '/',
            },
          ];
        },
      };

      const service = new Service(
        1,
        {
          name: 'service-one',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const routes = await loadRoutes([service]);

      expect(simplifyRoutes(routes)).toEqual([
        {
          pattern: '^/(?:/)?$',
          service: 'service-one',
        },
        {
          pattern: '^\\/about$',
          service: 'service-one',
        },
        {
          pattern: '^\\/about(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$',
          service: 'service-one',
        },
      ]);
    });

    it('logs a warning for an invalid rewrite', async () => {
      logger.warn = jest.fn();

      mockGlobSync.mockReturnValue([]);

      const nextConfig = {
        rewrites: async () => [{ source: '.*' }],
      };

      const service = new Service(
        1,
        {
          name: 'service-one',
          rootDir: '/path/to/service',
        },
        nextConfig,
        null,
      );

      const routes = await loadRoutes([service]);

      expect(simplifyRoutes(routes)).toEqual([]);
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid Next.js rewrite detected'),
      );
    });

    it.each([null, undefined, 'not-an-array'])(
      'ignores rewrites that return %s',
      async (rewrites) => {
        logger.warn = jest.fn();

        mockGlobSync.mockReturnValue([]);

        const nextConfig = {
          rewrites: async () => rewrites,
        };

        const service = new Service(
          1,
          {
            name: 'service-one',
            rootDir: '/path/to/service',
          },
          nextConfig,
          null,
        );

        const routes = await loadRoutes([service]);

        expect(simplifyRoutes(routes)).toEqual([]);
        expect(logger.warn).not.toHaveBeenCalled();
      },
    );
  });

  describe('specified routes', () => {
    it('includes any routes specified for each service', async () => {
      const nextConfig = {};
      const serviceOne = new Service(
        1,
        {
          name: 'service-one',
          rootDir: '/path/to/service',
          routes: ['/one/.*'],
        },
        nextConfig,
        null,
      );

      const serviceTwo = new Service(
        1,
        {
          name: 'service-two',
          rootDir: '/path/to/service',
          routes: ['/two/.*'],
        },
        nextConfig,
        null,
      );

      const routes = await loadRoutes([serviceOne, serviceTwo]);

      expect(simplifyRoutes(routes)).toEqual([
        {
          pattern: '/one/.*',
          service: 'service-one',
        },
        {
          pattern: '/two/.*',
          service: 'service-two',
        },
      ]);
    });
  });
});
