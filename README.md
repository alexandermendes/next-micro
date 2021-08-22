# Microproxy

[![npm version](https://badge.fury.io/js/microproxy.svg)](https://badge.fury.io/js/microproxy)

An HTTP router, reverse-proxy and process manager for composing Next.js microservices.

**Features:**

[**View the docs**](https://pages.github.com/alexandermendes/microproxy)

## Getting Started

Given a monorepo containing multiple Next.js microservices the easiest way
to get started is to install microproxy in the root of the monorepo:

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

And run:

```sh
yarn dev
```

The proxy should now be up and running at `http://127.0.0.1:3000`.

When we make requests to this address traffic will be routed to the Next.js
service that handles that route. If the service is not running it will be
launched automatically.

[View the full docs](https://pages.github.com/alexandermendes/microproxy) for
details of how to configure further.
