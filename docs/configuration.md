
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
- [`service.ttl`](#servicettl-number)
- [`service.scriptWaitTimeout`](#servicescriptwaittimeout-number)
- [`service.env`](#serviceenv-object)

## Reference

### `port` [number]

Default: `3000`

The port that the proxy server should listen for requests on.

### `autostart` [boolean]

Default: `false`

In development mode, if a route is hit for a service that is not accepting
requests then, when this setting is enabled, the service will be started
automatically using the script defined by the [`service.script`](#servicescript-string)
setting.

### `service.name` [string]

Default: `undefined`

A unique name for the service. This is used in log messages and CLI commands.

### `service.port` [number]

Default: `undefined`

A unique port for the service to listen for requests on.

### `service.routes` [array]

Default: `undefined`

An array of regular expression patterns denoting the routes served by the
service. Any routes not defined here will not be made available via the proxy.

### `service.script` [string]

Default: `undefined`

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

If the ready signal is not sent the request will remain pending until the
time defined by the [`service.scriptWaitTimeout`](#servicewaittimeout-number) setting.

### `service.ttl` [number]

Default: `undefined`

The length of time to keep the service alive after it last received a request.
Note that this will only work if the service was launched via Microproxy by
using the [`service.script`](#servicescript-string) setting.

### `service.scriptWaitTimeout` [number]

Default: `60000`

The length of time to wait when starting a service before timing out.

### `service.env` [object]

Default: `{}`

Environment variables to pass to your service in dev mode.

### `service.rootDir` [string]

Default: The root of the current repository

The root directory of your service, to be used when running the
[`service.script`](#servicescript-string) or running in [`service.watch`](#servicewatch-boolean)
mode.