
# Configuration

Microproxy can be configured from a `microproxy.config.js`, or
`microproxy.config.ts` file in the root of your repository, or via the
`microproxy` property of your `package.json` file.

```js
// microproxy.config.js
module.exports = {
  port: 3000,
  services: [
    {
      name: 'my-first-service',
      port: 7000,
      routes: ['/some/pages/.*'],
    },
    {
      name: 'my-second-service',
      port: 7001,
      routes: ['/some/more/pages/.*'],
    },
  ]
};
```

The following configuration options are available at the root level:

| name     | description |
|----------|-------------|
| port     | The port the proxy server should listen on. |
| services | The service configuration (see below). |

The `service` property accepts an array of objects with the following options:

| name   | description |
|--------|-------------|
| name   | A unique name for the service. |
| port   | The port that the service listens on. |
| routes | An array of regular expression patterns. |
| watch |


## Commands

- dev
