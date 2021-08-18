export type ConsoleArg =
  | string
  | number
  | boolean
  | bigint
  | Record<string, unknown>
  | Error;

export type LogFunction = {
  (...args: ConsoleArg[]): void;
};

export type Logger = {
  [index: string]: LogFunction;
  error: LogFunction;
  warn: LogFunction;
  info: LogFunction;
  success: LogFunction;
  log: LogFunction;
  debug: LogFunction;
};
