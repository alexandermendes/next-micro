# Getting Started

Given a monorepo containing multiple Next.js microservices the easiest way
to get started is to install Next Micro in the root of the monorepo:

```sh
npm install nextmicro -D
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

See the [Configuration](configuration.md) page for more fine-grained options.
