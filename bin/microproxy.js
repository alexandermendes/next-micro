#!/usr/bin/env node

if (process.env.NODE_ENV == null) {
  process.env.NODE_ENV = 'test';
}

// eslint-disable-next-line
require('../dist').cli();
