import { Writable } from 'stream';
import { createLogStream } from '../../../src/logger/stream';

describe('Logger: Stream', () => {
  it('writes the stream with whitespace trimmed', () => {
    const log = jest.fn();
    const cb = jest.fn();
    const stream = createLogStream(log);

    stream._write(Buffer.from(' Hello '), 'utf-8', cb);

    expect(stream).toBeInstanceOf(Writable);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('Hello');
  });
});
