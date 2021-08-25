# Next Micro

> An HTTP router, reverse-proxy and process manager for composing Next.js microservices.

## Overview

Microservices are all the rage nowadays. Next.js is a popular web framework.
Next Micro aims to address the scenario where we have a frontend comprising
various Next.js microservices and make working with those microservices easier.

Next Micro launches a reverse-proxy that becomes the entry point via
which all underlying services are accessed. When a route is hit Next Micro will
launch the responsible service automatically then, to help manage resources,
close it down after a specified time to live (TTL).

The available routes for each Next.js service are determined by parsing the
file system. Any additional routes can be specified directly in the configuration
file, as can any supplementary non Next.js services.

See the [Getting Started](getting-started.md) page for a quick start guide, or
the [Configuration](configuration.md) page for more fine-grained options.
