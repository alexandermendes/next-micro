import path from 'path';
import { validate } from '../../../src/config/validate';
import { MicroproxyConfig } from '../../../src/types/config';

describe('Config: Validate', () => {
  describe('no config', () => {
    it('throws if no config file was given', async () => {
      expect(() => validate(undefined, '/root')).toThrow(
        'Microproxy Config Error: config could be loaded from /root'
      );
    });
  });

  describe('valid config', () => {
    it('does not throw for a valid config', async () => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'my-service',
            port: 3001,
            routes: ['/one'],
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).not.toThrow();
    });
  });

  describe('names', () => {
    it.each([
      undefined,
      null,
      42,
    ])('throws if a service has a name with the value "%s"', async (name) => {
      const config = {
        port: 3000,
        services: [
          {
            name,
            port: 3001,
            routes: ['/one'],
          },
        ],
      } as unknown as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        /Microproxy Config Error: "services\[0\].name".*/
      );
    });

    it('throws if two services have the same name', async () => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'my-service',
            port: 3001,
            routes: ['/one'],
          },
          {
            name: 'my-service',
            port: 3002,
            routes: ['/two'],
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'Microproxy Config Error: "services[1]" contains a duplicate value for "name"'
      );
    });
  });

  describe('ports', () => {
    it.each([
      undefined,
      null,
      -1,
      'not-a-number',
    ])('throws if the root port has the value "%s"', async (port) => {
      const config = {
        port,
        services: [],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        /Microproxy Config Error: "port".*/
      );
    });

    it.each([
      undefined,
      null,
      -1,
      'not-a-number',
    ])('throws if a service has a port with the value "%s"', async (port) => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'my-service',
            port,
            routes: ['/one'],
          },
        ],
      } as unknown as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        /Microproxy Config Error: "services\[0\].port".*/
      );
    });

    it('throws if two services have the same port', async () => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'service-one',
            port: 3001,
            routes: ['/one'],
          },
          {
            name: 'service-two',
            port: 3001,
            routes: ['/two'],
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'Microproxy Config Error: "services[1]" contains a duplicate value for "port"'
      );
    });

    it('throws if the root port is missing', async () => {
      const config = {} as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'Microproxy Config Error: "port" is required'
      );
    });

    it('throws if the root port collides with a service port', async () => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'my-service',
            port: 3000,
            routes: ['/one'],
          }
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'Microproxy Config Error: "port" collides with "services[0].port"'
      );
    });
  });

  describe('routes', () => {
    it.each([
      undefined,
      null,
      'string',
      42,
      [42],
      [{}],
    ])('throws if a service has routes with the value "%s"', async (routes) => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'my-service',
            port: 3001,
            routes,
          },
        ],
      } as unknown as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        /Microproxy Config Error: "services\[0\].routes.*/
      );
    });
  });

  describe('script', () => {
    it.each([
      null,
      42,
      {},
      path.join(__dirname, 'nowhere'),
    ])('throws if a service has a script with the value "%s"', async (script) => {
      const config = {
        port: 3000,
        services: [
          {
            name: 'my-service',
            port: 3001,
            routes: ['/one'],
            script,
          },
        ],
      } as unknown as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        /Microproxy Config Error: "services\[0\].script.*/
      );
    });
  });
});
