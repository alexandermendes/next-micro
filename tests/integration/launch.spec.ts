import nock from 'nock';
import fetch from 'node-fetch';
import getPort from 'get-port';
import { launch } from '../../src/launch';
import { ProxyServer } from '../../src/proxy/server';
import { MicroproxyConfig } from '../../src/types/config';

const getMicroproxyConfig = async () => ({
  port: await getPort(),
  services: [
    {
      name: 'products',
      port: 3001,
      routes: ['/products'],
    },
    {
      name: 'accounts',
      port: 3002,
      routes: ['/accounts'],
    },
  ],
} as unknown as MicroproxyConfig);

nock(`http://127.0.0.1:3001`)
  .persist()
  .get('/products')
  .reply(200, 'service one replied');

nock(`http://127.0.0.1:3002`)
  .persist()
  .get('/accounts')
  .reply(200, 'service two replied');

describe('Launch', () => {
  let microproxyConfig: MicroproxyConfig;
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
    const resOne = await fetch(`http://127.0.0.1:${microproxyConfig.port}/products`);
    const textOne = await resOne.text()

    const resTwo = await fetch(`http://127.0.0.1:${microproxyConfig.port}/accounts`);
    const textTwo = await resTwo.text()

    expect(textOne).toBe('service one replied');
    expect(textTwo).toBe('service two replied');
  });
});
