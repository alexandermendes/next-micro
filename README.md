# Microproxy

[![npm version](https://badge.fury.io/js/microproxy.svg)](https://badge.fury.io/js/microproxy)

An HTTP router, reverse-proxy and process manager for composing microservices.

**Features:**

- Provides a single portal for accessing a site built from multiple microservices.
- Launches services automatically in development mode.
and brings them down after a given time to live (TTL) to save resources.
- Enables static or dynamic routing (e.g. based on settings retrieved via
an API call).
- Includes a plugin system to auto-detect routes for particular applications,
such as those built with Next.js.

[**View the docs**](https://pages.github.com/alexandermendes/microproxy)

## Getting Started

Depending on how you prefer to organise your code you may choose to install
Microproxy in a standalone repo containing the routing logic for your
microservices, or you may choose to install it in a monorepo that contains
the routing logic *and* your microservices.

In either case, install Microproxy as a dev dependency:

```sh
npm install microproxy -D
```

Add the following section to your `package.json`:

```json
{
  "scripts": {
    "dev": "microproxy dev",
    "build": "microproxy build",
    "start": "microproxy start",
  }
}
```

And add a configuration file to the root of your repository (example services shown):

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

To bring Microproxy up in development mode run:

```sh
yarn microproxy dev
```

The proxy should be up and running at `http://127.0.0.1:3000`. When we make
requests to this address all traffic that matches `/some/pages/.*` will be
routed to the first service and all traffic that matches `/some/more/pages/.*`
to the second.

[View the full docs](https://pages.github.com/alexandermendes/microproxy) for more
details of the available features.
