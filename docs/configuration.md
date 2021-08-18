
# Configuration

Microproxy can be configured from a `microproxy.config.js`, or
`microproxy.config.ts` file in the root of your repository, or via the
`microproxy` property of your `package.json` file.

A `package.json` example might look something like this:

```json
{
  "name": "my-microservices",
  "microproxy": {
    "port": 3000,
    "services": [
      {
        "name": "my-amazing-microservice",
        "port": 7000,
        "routes": ["/pages/.*"],
      },
    ]
  },
};
```

A `microproxy.config.js` (JavaScript) example might look something like this:

```js
module.exports = {
  port: 3000,
  services: [
    {
      name: 'my-first-service',
      port: 7000,
      routes: ['/pages/.*'],
    },
  ]
};
```

A `microproxy.config.ts` (TypeScript) example might look something like this:

```js
import type { MicroproxyConfig } from 'microproxy';

const config: MicroproxyConfig = {
  port: 3000,
  services: [
    {
      name: 'my-first-service',
      port: 7000,
      routes: ['/pages/.*'],
    },
  ]
};

export default config;
```

## Options

The following configuration options are available:

- [`port`](#port-number)
- [`autostart`](#autostart-boolean)
- [`service.name`](#servicename-string)
- [`service.port`](#serviceport-number)
- [`service.routes`](#serviceroutes-array)
- [`service.script`](#servicescript-string)

## Reference

### `port` [number]

The port that the proxy server should listen for requests on.

### `autostart` [boolean]

Default: `true`

In development mode, if a route is hit for a service that is not accepting
requests then, when this setting is enabled, the service will be started
automatically using the script defined by the [`service.script`](#servicescript-string)
setting.

### `service.name` [string]

A unique name for the service. This is used in log messages and CLI commands
such as `microproxy dev my-service`.

### `service.port` [number]

A unique port for the service to listen for requests on.

### `service.routes` [array]

An array of regular expression patterns denoting the routes served by the
service. Any routes not defined here will not be made available via the proxy.

### `service.script` [string]

A path to a script used to launch the service. This is required for
[`autostart`](#autostart-boolean) to work.

The script should call `process.send('ready')` once the service is ready to
accept requests, for example:

```js
const { serve } = require('./serve');

(async () => {
  await serve();

  if (process.send) {
    process.send('ready');
  }
})();
```
