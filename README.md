# Microproxy

[![npm version](https://badge.fury.io/js/microproxy.svg)](https://badge.fury.io/js/microproxy)

A reverse-proxy for composing micro-services.

**Table of Contents**

- [Overview](#overview)
- [Getting Started](#getting-started)

## Overview

Microservices are all the rage, with it not being uncommon for a website
nowadays to be built up from various services, each serving different sections
of that site. Despite the benefits this may bring, managing all of these services
during local local development can bbe a bit of a hassle. Ideally, when a new
developer joins a project, rather than giving them a long list of repositories
to clone and setup we would like to be able to point them to a single core
repository and give them a small set of commands to get the whole site
up and running. This is what Microproxy aims to help with.

Given some configuration details for each service, such as the routes they serve,
Microproxy launches a proxy server that becomes the entry point via which all
underlying services are accessed. When a route is hit Microproxy will
automatically launch the service responsible for serving that route. To help
manage resources each service is given a (configurable) time to live. Once the
service has not been accessed for this length of time it will be shut down.

## Getting Started

Install Microproxy using your favourite package manager:

```sh
# npm
npm install microproxy -D

# yarn
yarn install microproxy -D
```


## Configuration

The

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
