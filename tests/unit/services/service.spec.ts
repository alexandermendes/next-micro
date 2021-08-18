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
};

const mockSpawn = mocked(spawn);

mockSpawn.mockReturnValue(mockChildProcess as unknown as ChildProcess);

const originalLoggerError = logger.error;

describe('Services: Service', () => {
  beforeEach(() => {
    mockChildProcess.on.mockImplementation(() => null);
  });

  afterEach(() => {
    logger.error = originalLoggerError;
  });

  describe('launch', () => {
    it('launches the service', async () => {
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

      const launched = await service.launch();

      expect(launched).toBe(true);
      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenCalledWith('node', [serviceConfig.script], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          PORT: String(serviceConfig.port),
        },
      });
    });

    it('does not attempt to launch the service twice', async () => {
      logger.error = jest.fn();

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
});
