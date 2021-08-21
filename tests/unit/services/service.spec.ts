import path from 'path';
import appRoot from 'app-root-path';
import { ChildProcess, spawn } from 'child_process';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../src/logger';
import { Service, ServiceConfig } from '../../../src/services/service';

jest.mock('child_process');
jest.useFakeTimers();

const mockChildProcess = {
  stdout: { pipe: jest.fn() },
  stderr: { pipe: jest.fn() },
  on: jest.fn(),
  kill: jest.fn(),
};

const mockSpawn = mocked(spawn);

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
    it('launches the service', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

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
        env: {
          ...process.env,
          PORT: String(serviceConfig.port),
        },
      });
    });

    it('runs the script relative to the app root if no rootDir given', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();

      expect(mockSpawn.mock.calls[0][1]).toEqual([
        path.join(appRoot.path, String(serviceConfig.script))
      ]);
    });

    it('does not attempt to launch the service twice', async () => {
      logger.error = jest.fn();

      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      const launchedOne = await service.launch();
      const launchedTwo = await service.launch();

      expect(launchedOne).toBe(true);
      expect(launchedTwo).toBe(false);
      expect(spawn).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        new Error('Service is already running: service-one')
      );
    });

    it('logs an error if there is no startup script', async () => {
      logger.error = jest.fn();

      const serviceConfig = {
        port: 1234,
        name: 'service-one',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

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
        new Error('Service has no startup script: service-one')
      );
    });

    it('times out after 60 seconds by default when launching a service with no ready signal', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

      const promise = service.launch();

      expect(promise).toBeInstanceOf(Object);
      expect(promise.then).toBeInstanceOf(Function);

      jest.advanceTimersByTime(60000);

      expect(await promise).toBe(false);
    });

    it('times out after a custom duration when launching a service with no ready signal', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
        scriptWaitTimeout: 5000,
      } as ServiceConfig;

      const service = new Service(serviceConfig);

      const promise = service.launch();

      expect(promise).toBeInstanceOf(Object);
      expect(promise.then).toBeInstanceOf(Function);

      jest.advanceTimersByTime(5000);

      expect(await promise).toBe(false);
    });
  });

  describe('close', () => {
    it('kills and relaunches the service', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

      mockChildProcess.on.mockImplementation((scope, cb) => {
        if (scope === 'message') {
          cb('ready');
        }
      });

      await service.launch();
      service.close();

      expect(mockChildProcess.kill).toHaveBeenCalledTimes(1);
      expect(mockChildProcess.kill).toHaveBeenCalledWith();

      const relaunched = await service.launch();

      expect(relaunched).toBe(true);
    });

    it('does nothing if the service is not running', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        rootDir: '/root',
      } as ServiceConfig;

      const service = new Service(serviceConfig);

      logger.warn = jest.fn();
      service.close();

      expect(mockChildProcess.kill).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith('Service is not running: service-one');
    });
  });

  describe('refreshTTL', () => {
    it('kills the service after the given TTL', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        ttl: 1000,
      } as ServiceConfig;

      const service = new Service(serviceConfig);

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

    it('refreshes the TTLL', async () => {
      const serviceConfig = {
        port: 1234,
        name: 'service-one',
        script: '/path/to/script.js',
        ttl: 1000,
      } as ServiceConfig;

      const service = new Service(serviceConfig);

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
});
