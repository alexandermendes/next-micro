# Next Micro

[![npm version](https://badge.fury.io/js/next-micro.svg)](https://badge.fury.io/js/next-micro)

An HTTP router, reverse-proxy and process manager for composing Next.js microservices.

Next Micro launches a reverse-proxy that becomes the entry point via which all
underlying services are accessed. When a route is hit Next Micro will launch
the responsible service automatically then, to help manage resources, close it
down after a specified time to live (TTL).

The available routes for each Next.js service are determined by parsing the
file system. Any additional routes can be specified directly in the configuration
file, as can any supplementary non Next.js services.

[**View the docs**](https://alexandermendes.github.io/next-micro/)

## Getting Started

Given a monorepo containing multiple Next.js microservices the easiest way
to get started is to install Next Micro in the root of the monorepo:

```sh
npm install next-micro -D
```

Add the following section to your `package.json`:

```json
{
  "scripts": {
    "dev": "nextmicro dev",
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

[View the full docs](https://alexandermendes.github.io/next-micro/) for
details of how to configure further.
