# Microproxy

[![npm version](https://badge.fury.io/js/microproxy.svg)](https://badge.fury.io/js/microproxy)

An HTTP router and reverse-proxy for composing micro-services.

## Installation

Install Microproxy using your favourite package manager:

```sh
# npm
npm install microproxy -D

# yarn
yarn install microproxy -D
```

## Configuration

Microproxy can be configured from a `microproxy.config.js`, or `microproxy.config.ts`
file in the root of your repository, or via the `microproxy` property of your
`package.json` file.

A basic TypeScript example is shown below (for vanilla JS just exclude the
import and type assertion).

```ts
import { MicroproxyConfig } from 'microproxy';

// microproxy.config.ts
module.exports = <MicroproxyConfig>{
  services: [
    {
      name: 'my-first-service',
      port: 7000,
      routes: [
        '/some/pages/.*'
        '/some/more/pages/.*'
      ],
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

## Service Configuration

A service config file contains the following properties.

| name  | description |
|-------|-------------|
| start | A function to call when launching the service. |
| close | A function to call when closing the service.   |
| port  | The preferred port for the service.            |
| watch |
