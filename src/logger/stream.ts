import { Writable } from 'stream';
import { LogFunction } from './types';

export const createLogStream = (log: LogFunction): Writable => {
  const writableStream = new Writable();

  writableStream._write = (chunk, encoding, next) => {
    log(chunk.toString().trim());
    next();
  };

  return writableStream;
};
