
# Configuration

Next Micro can be configured from a `nextmicro.config.js`, or
`nextmicro.config.ts` file in the root of your repository, or via the
`nextmicro` property of your `package.json` file.

A `package.json` example might look something like this:

```json
{
  "name": "my-microservices",
  "nextmicro": {
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

A `nextmicro.config.js` (JavaScript) example might look something like this:

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

A `nextmicro.config.ts` (TypeScript) example might look something like this:

```js
import type { NextMicroConfig } from 'nextmicro';

const config: NextMicroConfig = {
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
- [`autoload`](#autoload-boolean)
- [`service.rootDir`](#servicerootdir-string)
- [`service.name`](#servicename-string)
- [`service.version`](#serviceversion-string)
- [`service.port`](#serviceport-number)
- [`service.routes`](#serviceroutes-array)
- [`service.script`](#servicescript-string)
- [`service.scriptWaitTimeout`](#servicescriptwaittimeout-number)
- [`service.ttl`](#servicettl-number)
- [`service.env`](#serviceenv-object)

## Reference

### `port` [number]

Default: `3000`

The port that the proxy server should listen for requests on.

### `autostart` [boolean]

Default: `true`

In development mode, if a route is hit for a service that is not accepting
requests then, when this setting is enabled, the service will be started
automatically using the script defined by the [`service.script`](#servicescript-string)
setting.

### `autoload` [boolean]

Default: `true`

Load the available services automatically by searching for directories with
`next.config.js` files.

### `service.rootDir` [string]

Default: `undefined`

The root directory of your service, to be used when running the
[`service.script`](#servicescript-string) or running in [`service.watch`](#servicewatch-boolean)
mode.


### `service.name` [string]

Default: The `name` from the service's `package.json`

A unique name for the service. This is used in log messages and CLI commands.

### `service.version` [string]

Default: The `version` from the service's `package.json`

A version identifier for the service. Used when giving feedback about managed services.

### `service.port` [number]

Default: *Auto-assigned (see below)*

A unique port for the service to listen for requests on.

For ease of initial setup, by default a port will be auto-assigned to each
service on launch by finding the first available port in a range of 100 starting
from the main [`port`](#port-number) and falling back to a random port. However,
there is some risk of race conditions with this approach if another process
starts using the port before the service is launched. To help avoid confusion
it is probably best to assign a fixed port to each service.

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

### `service.scriptWaitTimeout` [number]

Default: `60000`

The length of time to wait when starting a service before timing out.

### `service.ttl` [number]

Default: `undefined`

The length of time to keep the service alive after it last received a request.
Note that this will only work if the service was launched using the
[`service.script`](#servicescript-string) setting.

### `service.env` [object]

Default: `{}`

Environment variables to pass to your service in dev mode.

Note that the `PORT` variable will always be passed to the service with the
value set via the [`service.port`](#serviceport-number) option.
