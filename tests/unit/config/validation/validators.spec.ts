import fs from 'fs';
import Joi from 'joi';
import { mocked } from 'ts-jest/utils';
import { NextMicroConfig, ServiceConfig } from '../../../../src/config';
import * as validators from '../../../../src/config/validation/validators';

jest.mock('fs');

const mockFs = mocked(fs);

const getHelpers = (state: Record<string, unknown>): Joi.CustomHelpers =>
  ({
    message: jest.fn(() => 'mock-joi-msg'),
    state,
  } as unknown as Joi.CustomHelpers);

describe('Config: Validation - Validators', () => {
  describe('file', () => {
    beforeEach(() => {
      mockFs.lstatSync.mockReturnValue({
        isFile: () => true,
      } as unknown as fs.Stats);
    });

    it('returns a valid path', () => {
      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.file('/path', helpers);

      expect(result).toBe('/path');
    });

    it('returns a message if the path is not a file', () => {
      mockFs.lstatSync.mockReturnValue({
        isFile: () => false,
      } as unknown as fs.Stats);

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.file('/path', helpers);

      expect(result).toBe('mock-joi-msg');
      expect(helpers.message).toHaveBeenCalledTimes(1);
      expect(helpers.message).toHaveBeenCalledWith({
        custom: '"my-field" is not a file',
      });
    });

    it('returns a message if the path does not exist', () => {
      mockFs.lstatSync.mockImplementation((): fs.Stats => {
        throw new Error('no good');
      });

      const helpers = getHelpers({ path: ['arr', 1, 'my-field'] });
      const result = validators.file('/path', helpers);

      expect(result).toBe('mock-joi-msg');
      expect(helpers.message).toHaveBeenCalledTimes(1);
      expect(helpers.message).toHaveBeenCalledWith({
        custom: '"arr[1].my-field" is not a file',
      });
    });
  });

  describe('dir', () => {
    beforeEach(() => {
      mockFs.lstatSync.mockReturnValue({
        isFile: () => false,
      } as unknown as fs.Stats);
    });

    it('returns a valid path', () => {
      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.dir('/path', helpers);

      expect(result).toBe('/path');
    });

    it('returns a message if the path is a file', () => {
      mockFs.lstatSync.mockReturnValue({
        isFile: () => true,
      } as unknown as fs.Stats);

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.dir('/path', helpers);

      expect(result).toBe('mock-joi-msg');
      expect(helpers.message).toHaveBeenCalledTimes(1);
      expect(helpers.message).toHaveBeenCalledWith({
        custom: '"my-field" is not a directory',
      });
    });

    it('returns a message if the path does not exist', () => {
      mockFs.lstatSync.mockImplementation((): fs.Stats => {
        throw new Error('no good');
      });

      const helpers = getHelpers({ path: ['arr', 1, 'my-field'] });
      const result = validators.dir('/path', helpers);

      expect(result).toBe('mock-joi-msg');
      expect(helpers.message).toHaveBeenCalledTimes(1);
      expect(helpers.message).toHaveBeenCalledWith({
        custom: '"arr[1].my-field" is not a directory',
      });
    });
  });

  describe('uniqueRootPort', () => {
    it('returns a valid config', () => {
      const config = {
        port: 1000,
        services: [
          {
            port: 2000,
          },
        ],
      } as unknown as NextMicroConfig;

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.uniqueRootPort(config, helpers);

      expect(result).toBe(config);
    });

    it('returns a message if the config contains clashing ports', () => {
      const config = {
        port: 1000,
        services: [
          {
            port: 1000,
          },
        ],
      } as unknown as NextMicroConfig;

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.uniqueRootPort(config, helpers);

      expect(result).toBe('mock-joi-msg');
      expect(helpers.message).toHaveBeenCalledTimes(1);
      expect(helpers.message).toHaveBeenCalledWith({
        custom: '"port" collides with "services[0].port"',
      });
    });
  });

  describe('script', () => {
    it('returns a valid config with an absolute script path', () => {
      const fileValidatorSpy = jest.spyOn(validators, 'file');

      const serviceConfig: ServiceConfig = {
        port: 1000,
        script: '/path/to/script/.js',
        rootDir: '/root',
      };

      fileValidatorSpy.mockReturnValue('/path/to/script/.js');

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.script(serviceConfig, helpers);

      expect(result).toBe(serviceConfig);
      expect(fileValidatorSpy).toHaveBeenCalledTimes(1);
      expect(fileValidatorSpy).toHaveBeenCalledWith('/path/to/script/.js', helpers);
    });

    it('returns a valid config with a relative script path', () => {
      const fileValidatorSpy = jest.spyOn(validators, 'file');

      const serviceConfig: ServiceConfig = {
        port: 1000,
        script: 'script.js',
        rootDir: '/root',
      };

      fileValidatorSpy.mockReturnValue('/root/script.js');

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.script(serviceConfig, helpers);

      expect(result).toBe(serviceConfig);
      expect(fileValidatorSpy).toHaveBeenCalledTimes(1);
      expect(fileValidatorSpy).toHaveBeenCalledWith('/root/script.js', helpers);
    });

    it('returns a message for an invalid script path', () => {
      const fileValidatorSpy = jest.spyOn(validators, 'file');

      const serviceConfig: ServiceConfig = {
        port: 1000,
        script: 'script.js',
        rootDir: '/root',
      };

      fileValidatorSpy.mockReturnValue({ code: 'failed' } as Joi.ErrorReport);

      const helpers = getHelpers({ path: 'my-field' });
      const result = validators.script(serviceConfig, helpers);

      expect(result).toEqual({ code: 'failed' });
    });
  });
});
