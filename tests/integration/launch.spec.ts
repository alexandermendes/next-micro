import path from 'path';
import nock from 'nock';
import fetch from 'node-fetch';
import getPort from 'get-port';
import { launch } from '../../src/launch';
import { ProxyServer } from '../../src/proxy/server';
import { ConcreteNextMicroConfig } from '../../src/config';

const exampleDir = path.join(__dirname, '..', '..', 'example');

const getNextMicroConfig = async () =>
  ({
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
  } as unknown as ConcreteNextMicroConfig);

nock(`http://127.0.0.1:3001`)
  .persist()
  .get('/api/hello')
  .reply(200, 'service one replied');

nock(`http://127.0.0.1:3002`)
  .persist()
  .get('/home')
  .reply(200, 'service two replied');

describe('Launch', () => {
  let nextmicroConfig: ConcreteNextMicroConfig;
  let proxyServer: ProxyServer;

  beforeAll(async () => {
    nextmicroConfig = await getNextMicroConfig();

    jest.doMock('../../nextmicro.config', () => nextmicroConfig);
  });

  beforeAll(async () => {
    proxyServer = await launch();
  });

  afterAll(() => {
    proxyServer?.close();
  });

  it('routes requests to the correct backend', async () => {
    const resOne = await fetch(
      `http://127.0.0.1:${nextmicroConfig.port}/api/hello`,
    );

    const textOne = await resOne.text();
    const resTwo = await fetch(`http://127.0.0.1:${nextmicroConfig.port}/home`);
    const textTwo = await resTwo.text();

    expect(textOne).toBe('service one replied');
    expect(textTwo).toBe('service two replied');
  });
});
