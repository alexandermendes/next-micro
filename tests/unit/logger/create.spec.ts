import { createLogger } from '../../../src/logger';

const originalStdOutWrite = process.stdout.write;
const originalStdErrWrite = process.stderr.write;

describe('Logger', () => {
  beforeAll(() => {
    process.stdout.write = jest.fn();
    process.stderr.write = jest.fn();
  });

  afterAll(() => {
    process.stdout.write = originalStdOutWrite;
    process.stderr.write = originalStdErrWrite;
  });

  it.each(['warn', 'info', 'success', 'log', 'debug'])(
    'logs %s to stdout',
    (type) => {
      const writeSpy = jest.spyOn(process.stdout, 'write');
      const logger = createLogger({ logLevel: 'DEBUG' });

      logger[type]('Hello');

      expect(writeSpy).toHaveBeenCalledTimes(1);
      expect(writeSpy.mock.calls[0][0]).toEqual(
        expect.stringContaining('Hello'),
      );
    },
  );

  it('logs errors to stderr', () => {
    const writeSpy = jest.spyOn(process.stderr, 'write');
    const logger = createLogger({ logLevel: 'DEBUG' });

    logger.error(new Error('bad thing'));

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(String(writeSpy.mock.calls[0][0])).toEqual(
      expect.stringContaining('bad thing'),
    );
  });

  it('does not log messages below the log level', () => {
    const writeSpy = jest.spyOn(process.stdout, 'write');

    const logger = createLogger({ logLevel: 'ERROR' });
    logger.warn('Hello');

    expect(writeSpy).not.toHaveBeenCalled();
  });

  it('logs messages at the log level', () => {
    const writeSpy = jest.spyOn(process.stdout, 'write');

    const logger = createLogger({ logLevel: 'WARN' });
    logger.warn('Hello');

    expect(writeSpy).toHaveBeenCalled();
  });

  it('disables colours', () => {
    const writeSpy = jest.spyOn(process.stdout, 'write');

    const logger = createLogger({
      logLevel: 'LOG',
      colours: false,
    });

    logger.log('Hello');

    expect(writeSpy).toHaveBeenCalledWith('Hello\n');
  });

  it('creates a logger that with some reasonable defauts', () => {
    const writeSpy = jest.spyOn(process.stdout, 'write');
    const logger = createLogger();

    logger.log('log');
    logger.debug('debug');

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(String(writeSpy.mock.calls[0][0])).toContain('log');
  });
});
