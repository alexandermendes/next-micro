# Next Micro

> An HTTP router and reverse-proxy for composing microservices.

## Overview

Microservices are all the rage nowadays, with it not being uncommon for a
website to be built up from various services, each serving different sections
of that site. Next Micro aims to make managing such a scenario easier and
provide a single, unified experience, both during local development and in
production.

Given some configuration details for each service, Next Micro launches a
reverse-proxy server that becomes the entry point via which all those underlying
services are accessed. When a route is hit Next Micro will route
traffic to the appropriate backend.

In development mode, Next Micro can be configured to automatically launch the
service responsible for serving a particular route only once it is hit then, to
help manage resources, close it down after a specified time to live (TTL).
