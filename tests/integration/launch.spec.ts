import path from 'path';
import nock from 'nock';
import fetch from 'node-fetch';
import getPort from 'get-port';
import { launch } from '../../src/launch';
import { ProxyServer } from '../../src/proxy/server';
import { ConcreteMicroproxyConfig } from '../../src/config';

const exampleDir = path.join(__dirname, '..', '..', 'example');

const getMicroproxyConfig = async () => ({
  port: await getPort(),
  services: [
    {
      name: 'api',
      port: 3001,
      routes: ['/api/.*'],
      rootDir: path.join(exampleDir, 'api'),
    },
    {
      port: 3002,
      rootDir: path.join(exampleDir, 'frontend'),
    },
  ],
} as unknown as ConcreteMicroproxyConfig);

nock(`http://127.0.0.1:3001`)
  .persist()
  .get('/api/hello')
  .reply(200, 'service one replied');

nock(`http://127.0.0.1:3002`)
  .persist()
  .get('/home')
  .reply(200, 'service two replied');

describe('Launch', () => {
  let microproxyConfig: ConcreteMicroproxyConfig;
  let proxyServer: ProxyServer;

  beforeAll(async () => {
    microproxyConfig = await getMicroproxyConfig();

    jest.doMock('../../microproxy.config', () => (microproxyConfig))
  });

  beforeAll(async () => {
    proxyServer = await launch();
  });

  afterAll(() => {
    proxyServer?.close();
  });

  it('routes requests to the correct backend', async () => {
    const resOne = await fetch(`http://127.0.0.1:${microproxyConfig.port}/api/hello`);
    const textOne = await resOne.text()

    const resTwo = await fetch(`http://127.0.0.1:${microproxyConfig.port}/home`);
    const textTwo = await resTwo.text()

    expect(textOne).toBe('service one replied');
    expect(textTwo).toBe('service two replied');
  });
});
