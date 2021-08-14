import { validate } from '../../../src/config/validate';
import { MicroproxyConfig } from '../../../src/types/config';

describe('Config', () => {
  describe('no config', () => {
    it('throws if no config file was given', async () => {
      expect(() => validate(undefined, '/root')).toThrow(
        'No config could be loaded from /root'
      );
    });
  });

  describe('name', () => {
    it('throws if a name is missing', async () => {
      const config = {
        services: [
          {
            port: 3000,
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'All service configs must include the "name" property.'
      );
    });

    it('throws if two services have the same name', async () => {
      const config = {
        services: [
          {
            name: 'my-service',
            port: 3000,
          },
          {
            name: 'my-service',
            port: 3001,
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'Duplicate name(s) found in service configs: my-service'
      );
    });
  });

  describe('port', () => {
    it('throws if a port is missing', async () => {
      const config = {
        services: [
          {
            name: 'my-service',
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'All service configs must include the "port" property.'
      );
    });

    it('throws if two services have the same port', async () => {
      const config = {
        services: [
          {
            name: 'service-one',
            port: 1234,
          },
          {
            name: 'service-two',
            port: 1234,
          },
        ],
      } as MicroproxyConfig;

      expect(() => validate(config, '/root')).toThrow(
        'Duplicate port(s) found in service configs: 1234'
      );
    });
  });
});
