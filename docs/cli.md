# CLI

The Next Micro command line interface provides the following commands:

## dev

Bring the reverse-proxy up in dev mode. Routes will be loaded from the file
system automatically (for Next.js services) and watched for changes.

```
nextmicro dev
```

The default behaviour is to launch a service when a request is first made to
that service. However, if you want to bring particular services you can do
so by passing the names of those services as positional arguments, for example:

```
nextmicro dev service-one service-two
```
