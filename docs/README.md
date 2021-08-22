# Microproxy

> An HTTP router and reverse-proxy for composing microservices.

## Overview

Microservices are all the rage nowadays, with it not being uncommon for a
website to be built up from various services, each serving different sections
of that site. Microproxy aims to make managing such a scenario easier and
provide a single, unified experience, both during local development and in
production.

Given some configuration details for each service, Microproxy launches a
reverse-proxy server that becomes the entry point via which all those underlying
services are accessed. When a route is hit Microproxy will route
traffic to the appropriate backend.

In development mode, Microproxy can be configured to automatically launch the
service responsible for serving a particular route only once it is hit then, to
help manage resources, close it down after a specified time to live (TTL).

Routing can be handled by maintaining static lists of regex patterns, via a
custom routing function, or via a set of plugins that help establish routes
automatically for popular frameworks such as Next.js and Express.

## Features

- Provides a single portal for accessing a site built from multiple microservices.
- Launches services automatically in development mode
and brings them down after a given time to live (TTL) to save resources.
- Enables static or dynamic routing (e.g. based on settings retrieved via
an API call).
- Includes a plugin system to auto-detect routes for particular applications,
such as those built with Next.js.

---

