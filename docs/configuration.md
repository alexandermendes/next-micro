
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

A `nextmicro.config.js` example might look something like this:

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

A `nextmicro.config.ts` example might look something like this:

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
- [`ignore`](#ignore-array)
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
automatically.

For non Next.js sevices, or Next.js services that use some custom server,
[`service.script`](#servicescript-string) must also be set for this to work.

### `autoload` [boolean]

Default: `true`

Load the available Next.js services automatically by searching for directories
with `next.config.js` files.

### `ignore` [array]

Default: `['/node_modules/']`

An array of regexp pattern strings that are matched against the paths of
discovered services. If a path matches any of the patterns, it will be skipped.

### `service.rootDir` [string]

Default: `undefined`

The root directory of your service, to be used when running the
[`service.script`](#servicescript-string).

### `service.name` [string]

Default: *The `name` from the service's `package.json`*

A unique name for the service. This is used in log messages and CLI commands.

### `service.version` [string]

Default: *The `version` from the service's `package.json`*

A version identifier for the service. Used when giving feedback about managed services.

### `service.port` [number]

Default: *Auto-assigned (see below)*

A unique port for the service to listen for requests on.

By default, a port will be auto-assigned to each service on launch by finding
the first available port in a range of 100 starting from the main
[`port`](#port-number) and falling back to a random port. This makes initial
setup a little easier, however, this approach does lead to a risk of race
conditions if another process starts using the port before the service is
launched. To help avoid confusion it may be best to assign a fixed port
to each service.

### `service.routes` [array]

Default: `undefined`

An array of regular expression patterns denoting the routes served by the
service. Any routes not defined here will not be made available via the proxy.

Note that it is not necessary to set the routes for Next.js services. The
exception to this is where not all routes are defined from the pages directory
(e.g. you are running some kind of custom server).

### `service.script` [string]

Default: `undefined`

A path to a script used to launch the service. For non Next.js services this is
required for [`autostart`](#autostart-boolean) to work.

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
time defined by the [`service.scriptWaitTimeout`](#servicescriptwaittimeout-number) setting.

### `service.scriptWaitTimeout` [number]

Default: `60000`

The length of time to wait while launching a service before timing out.

### `service.ttl` [number]

Default: `undefined`

The length of time to keep the service alive after it last received a request.
Note that this will only work if the process is being managed by Next Micro.

### `service.env` [object]

Default: `{}`

Environment variables to pass to your service in dev mode. Note that the `PORT`
variable will always be passed to the service with the value set via the
[`service.port`](#serviceport-number) option.
