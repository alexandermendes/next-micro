# Getting Started

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
