# Microproxy

[![npm version](https://badge.fury.io/js/microproxy.svg)](https://badge.fury.io/js/microproxy)

An HTTP router and reverse-proxy for composing microservices.

## Getting Started

Depending on how you prefer to organise your code you may choose to install
Microproxy in a standalone repo that contains just the routing logic for your
microservices, or you may choose to install it in a monorepo that you use to
manage multiple microservices. In either case, install Microproxy using yourfavourite package manager:

```sh
# npm
npm install microproxy -D

# yarn
yarn install microproxy -D
```

Add the following section to your `package.json` (you may choose to get more
specific about mapping Microproxy commands in future):

```json
{
  "scripts": {
    "microproxy": "microproxy"
  }
}
```

We now need to tell Microproxy about the services we would like it to manage.
Let's assume we have two microservices, running at `http://127.0.0.1:7000` and
`http://127.0.0.1:7001`. A basic configuration file might look something like
this:

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

Now, when we make a request to `http://127.0.0.1:3000` it will route all traffic
that matches `/some/pages/.*` to the first service and all traffic that matches
`/some/more/pages/.*` to the second.

There are many more options available, such as:
- Launching a service automatically in development mode if not already running
and bringing it down after a given Time to Live (TTL) to save resources.
- Integration of dynamic routing logic, based on settings retrieved via an API
call, for example.
- Using a plugin system to auto-detect routes for particular applications,
such as those built with Next.js.

## Configuration

Microproxy can be configured from a `microproxy.config.js`, or
`microproxy.config.ts` file in the root of your repository, or via the
`microproxy` property of your `package.json` file.

```ts
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

## Commands

- dev

### ``

## Ideas

- Optional template files. If template contains a next.js config file, for
- example, use it, otherwise fallback to the default.
- Deployable dynamic router
- Status page
- Set TTL on each service
- Generate TS or JS next app
- The service config file can be optional.
- Watch for new/removed/modified services while the dev server is running
- Put back custom routes
- Allow override of pkg name as service name
- Check for clashing package names
- Use workspaces option for monorepos
- microproxy --init to generate a basic config file

## Service Configuration

A service config file contains the following properties.

| name  | description |
|-------|-------------|
| start | A function to call when launching the service. |
| close | A function to call when closing the service.   |
| port  | The preferred port for the service.            |
| watch |
