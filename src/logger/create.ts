import { sep } from 'path';
import { format } from 'util';
import chalk from 'chalk';
import { LogFunction, Logger, ConsoleArg } from './types';

enum LogLevel {
  ERROR,
  WARN,
  INFO,
  SUCCESS,
  LOG,
  DEBUG,
}

type LogLevelStrings = keyof typeof LogLevel;

type LoggerOptions =
  | Record<string, never>
  | {
      tag?: string;
      logLevel?: string;
      colours?: boolean;
    };

/**
 * Format a stack trace.
 */
const formatStack = (stack: string, tag: string | undefined) => {
  const cwd = process.cwd() + sep;

  const lines = stack
    .split('\n')
    .splice(1)
    .map((line: string) => line.trim().replace('file://', '').replace(cwd, ''));

  const prepend = tag ? `[${tag}]` : '';

  return `${prepend} ${lines.join(`\n${prepend} `)}`;
};

/**
 * Format log arguments.
 */
const formatArgs = (args: ConsoleArg[], tag: string | undefined) => {
  const _args = args.map((arg: ConsoleArg) => {
    if (arg instanceof Error && typeof arg.stack === 'string') {
      return arg.message + '\n' + formatStack(arg.stack, tag);
    }

    return arg;
  });

  const str = format(..._args);
  const prepend = tag ? `[${tag}]` : '';

  if (!prepend) {
    return str;
  }

  return str
    .split(/\r?\n/)
    .map((line) => `${prepend} ${line}`)
    .join('\n');
};

/**
 * Write a log message to the appropriate stream.
 */
const writeStream = (level: number, msg: string) => {
  if (level < 1) {
    process.stderr.write(msg);

    return;
  }

  process.stdout.write(msg);
};

/**
 * Get the current log level.
 */
const getActiveLogLevel = (logOpts: LoggerOptions): LogLevel => {
  const activeLevelKey = String(logOpts.logLevel).toUpperCase();

  return LogLevel[<LogLevelStrings>activeLevelKey];
};

/**
 * Create a log function.
 */
const createLogFunction =
  (logOpts: LoggerOptions, level: LogLevel, color = chalk.white): LogFunction =>
  (...args: ConsoleArg[]) => {
    const { tag } = logOpts;
    let message = formatArgs(args, tag);

    if (tag) {
      message = `[${logOpts.tag}] ${message}`;
    }

    if (logOpts.colours) {
      message = color(message);
    }

    if (level > getActiveLogLevel(logOpts)) {
      return;
    }

    writeStream(level, `${message}\n`);
  };

/**
 * A basic custom logger that prettifies log messages.
 */
export const createLogger = (logOpts: LoggerOptions = {}): Logger => {
  const defaultLogOpts = {
    logLevel: 'log',
    colours: true,
  };

  const opts = Object.assign({}, defaultLogOpts, logOpts);

  return {
    error: createLogFunction(opts, LogLevel.ERROR, chalk.red),
    warn: createLogFunction(opts, LogLevel.WARN, chalk.yellow),
    info: createLogFunction(opts, LogLevel.INFO, chalk.cyan),
    success: createLogFunction(opts, LogLevel.SUCCESS, chalk.green),
    log: createLogFunction(opts, LogLevel.LOG),
    debug: createLogFunction(opts, LogLevel.DEBUG),
  };
};
