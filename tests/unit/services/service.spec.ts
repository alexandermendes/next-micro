import { ChildProcess, spawn } from 'child_process';
import { mocked } from 'ts-jest/utils';
import { logger } from '../../../src/logger';
import { Service, ServiceConfig } from '../../../src/services/service';

jest.mock('child_process');

const mockChildProcess = {
  stdout: { pipe: jest.fn() },
  stderr: { pipe: jest.fn() },
  on: jest.fn(),
};

const mockSpawn = mocked(spawn);

mockSpawn.mockReturnValue(mockChildProcess as unknown as ChildProcess);

const originalLoggerError = logger.error;

describe('Services: Service', () => {
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

      await service.launch();

      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenCalledWith('node', [serviceConfig.script], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          PORT: String(serviceConfig.port),
        },
      });
    });

    it('logs an error if the process was already started', async () => {
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

      await service.launch();
      await service.launch();

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

      await service.launch();

      expect(spawn).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        new Error('Service has no startup script: service-one')
      );
    });
  });
});
