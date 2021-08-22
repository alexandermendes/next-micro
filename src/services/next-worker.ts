import path from 'path';
import http from 'http';
import { argv } from 'yargs';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import next from 'next';

const { dir, port } = argv;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextConfig = require(path.join(dir as string, 'next.config.js'));
const nextApp = next({ conf: nextConfig, dev: true });

const nextHandler = nextApp.getRequestHandler();
const server = http.createServer(nextHandler);
const host = '127.0.0.1';

(async () => {
  await nextApp.prepare();

  server.listen(port as number, host, () => {
    console.log(`Service is running on http://${host}:${port}`);

    if (process.send) {
      process.send('ready');
    }
  });
})();
