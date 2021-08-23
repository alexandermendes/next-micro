import path from 'path';
import fs, { PathLike } from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../src/logger';
import { Service } from '../../../src/services/service';
import { ServiceConfig } from '../../../src/config';

jest.mock('fs');
jest.mock('child_process');
jest.useFakeTimers();

const mockChildProcess = {
  stdout: { pipe: jest.fn() },
  stderr: { pipe: jest.fn() },
  on: jest.fn(),
  kill: jest.fn(),
};

const mockSpawn = mocked(spawn);
const mockFs = mocked(fs);

mockSpawn.mockReturnValue(mockChildProcess as unknown as ChildProcess);

const originalLoggerError = logger.error;
const originalLoggerWarn = logger.warn;

describe('Services: Service', () => {
  beforeEach(() => {
    mockChildProcess.on.mockImplementation(() => null);
  });

  afterEach(() => {
    logger.error = originalLoggerError;
    logger.warn = originalLoggerWarn;
  });

  describe('launch', () => {
    it('launches a next.js service', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        rootDir: '/root',
      };

      const nextConfig = {};

      mockFs.existsSync.mockImplementationOnce(
        (filePath: PathLike): boolean => {
          return filePath === '/root/next.config.js';
        },
      );

      const service = new Service(1, serviceConfig, nextConfig, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      const launched = await service.launch();

      expect(launched).toBe(true);
      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenCalledWith(
        'node',
        [
          path.resolve(__dirname, '../../../src/services/next-worker.js'),
          '--dir',
          '/root',
          '--port',
          '1234',
        ],
        {
          stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
          cwd: '/root',
          env: {
            ...process.env,
            PORT: String(serviceConfig.port),
          },
        },
      );
    });

    it('launches a service using the custom script', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: 'path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      const launched = await service.launch();

      expect(launched).toBe(true);
      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenCalledWith('node', ['/root/path/to/script.js'], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        cwd: '/root',
        env: {
          ...process.env,
          PORT: String(serviceConfig.port),
        },
      });
    });

    it('runs the script from an absolute path', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/absolute/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();

      expect(mockSpawn.mock.calls[0][1]).toEqual([
        '/absolute/path/to/script.js',
      ]);
    });

    it('does not attempt to launch the service twice', async () => {
      logger.error = jest.fn();

      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      const launchedOne = await service.launch();
      const launchedTwo = await service.launch();

      expect(launchedOne).toBe(true);
      expect(launchedTwo).toBe(true);
      expect(spawn).toHaveBeenCalledTimes(1);
    });

    it('waits in case the child process is being launched from another request', async () => {
      logger.error = jest.fn();

      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();
      service.setRunning(false);

      const promise = service.launch();

      expect(promise).toBeInstanceOf(Object);
      expect(promise.then).toBeInstanceOf(Function);

      service.setRunning(true);
      jest.advanceTimersByTime(500);

      expect(await promise).toBe(true);
    });

    it('times out while waiting for the service to be launched from another request', async () => {
      logger.error = jest.fn();

      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();
      service.setRunning(false);

      const promise = service.launch();

      expect(promise).toBeInstanceOf(Object);
      expect(promise.then).toBeInstanceOf(Function);

      jest.advanceTimersByTime(60000);

      expect(await promise).toBe(false);
    });

    it('logs an error if there is no startup script and not a next service', async () => {
      logger.error = jest.fn();

      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      const launched = await service.launch();

      expect(launched).toBe(false);
      expect(spawn).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        new Error(
          'Service has no startup script and is not a Next.js service: service-one',
        ),
      );
    });

    it('times out after 60 seconds by default when launching a service with no ready signal', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      const promise = service.launch();

      expect(promise).toBeInstanceOf(Object);
      expect(promise.then).toBeInstanceOf(Function);

      jest.advanceTimersByTime(60000);

      expect(await promise).toBe(false);
    });

    it('times out after a custom duration when launching a service with no ready signal', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
        scriptWaitTimeout: 5000,
      };

      const service = new Service(1, serviceConfig, null, null);

      const promise = service.launch();

      expect(promise).toBeInstanceOf(Object);
      expect(promise.then).toBeInstanceOf(Function);

      jest.advanceTimersByTime(5000);

      expect(await promise).toBe(false);
    });
  });

  describe('close', () => {
    it('kills and relaunches the service', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();

      expect(service.isRunning()).toBe(true);

      service.close();

      expect(mockChildProcess.kill).toHaveBeenCalledTimes(1);
      expect(mockChildProcess.kill).toHaveBeenCalledWith();
      expect(service.isRunning()).toBe(false);

      const relaunched = await service.launch();

      expect(relaunched).toBe(true);
      expect(service.isRunning()).toBe(true);
    });

    it('does nothing if the service is not running', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      logger.warn = jest.fn();
      service.close();

      expect(mockChildProcess.kill).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        'Service is not running: service-one',
      );
    });
  });

  describe('refreshTTL', () => {
    it('kills the service after the given TTL', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
        ttl: 1000,
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();
      service.refreshTTL();

      expect(mockChildProcess.kill).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(mockChildProcess.kill).toHaveBeenCalled();
    });

    it('refreshes the TLL', async () => {
      const serviceConfig: ServiceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
        ttl: 1000,
      };

      const service = new Service(1, serviceConfig, null, null);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();
      service.refreshTTL();
      jest.advanceTimersByTime(500);
      service.refreshTTL();
      jest.advanceTimersByTime(500);

      expect(mockChildProcess.kill).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);

      expect(mockChildProcess.kill).toHaveBeenCalled();
    });
  });

  describe('name', () => {
    it('returns the name when a custom name is given', async () => {
      const serviceConfig: ServiceConfig = {
        name: 'my-service',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      expect(service.getName()).toBe('my-service');
    });

    it('returns the name from the package.json', async () => {
      const serviceConfig: ServiceConfig = {
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, {
        name: 'my-service',
        version: '1.2.3',
      });

      expect(service.getName()).toBe('my-service');
    });

    it('prefers a custom name', async () => {
      const serviceConfig: ServiceConfig = {
        name: 'custom-name',
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, {
        name: 'my-service',
        version: '1.2.3',
      });

      expect(service.getName()).toBe('custom-name');
    });

    it('returns a name based on the id as a fallback', async () => {
      const serviceConfig: ServiceConfig = {
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      expect(service.getName()).toBe('service 1');
    });
  });

  describe('version', () => {
    it('returns the version from the package.json', async () => {
      const serviceConfig: ServiceConfig = {
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, {
        name: 'my-service',
        version: '1.2.3',
      });

      expect(service.getVersion()).toBe('1.2.3');
    });

    it('returns unknown if no version found in the package.json', async () => {
      const serviceConfig: ServiceConfig = {
        rootDir: '/root',
      };

      const service = new Service(1, serviceConfig, null, null);

      expect(service.getVersion()).toBe('unknown');
    });
  });
});
