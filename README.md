# Next Micro

[![npm version](https://badge.fury.io/js/nextmicro.svg)](https://badge.fury.io/js/nextmicro)

An HTTP router, reverse-proxy and process manager for composing Next.js microservices.

**Features:**

[**View the docs**](https://pages.github.com/alexandermendes/nextmicro)

## Getting Started

Given a monorepo containing multiple Next.js microservices the easiest way
to get started is to install nextmicro in the root of the monorepo:

```sh
npm install nextmicro -D
```

Add the following section to your `package.json`:

```json
{
  "scripts": {
    "dev": "nextmicro dev",
    "build": "nextmicro build",
    "start": "nextmicro start",
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

[View the full docs](https://pages.github.com/alexandermendes/nextmicro) for
details of how to configure further.
