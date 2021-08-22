# Services

By default, Next Micro will search your repository to find any directories
containing a `next.config.js` file and load these as your available services.

If you want to be more specific about the services to load you can set the
`autoload` option in your root `nextmicro.config.js` file to `false` and
instead specify the services to load via the `services` option, for example:

```js
// nextmicro.config.js
module.exports = {
  services: [
    {
      rootDir: './services/one',
    },
    {
      rootDir: './services/two',
    },
  ]
};
```

This more specific approach also allows Next Micro to load non-Next.js services.
While the routes won't be determined automatically this can be useful if you
have other services closely integrated with your frontend, for example:

```js
// nextmicro.config.js
module.exports = {
  services: [
    {
      rootDir: './services/my-next-service',
    },
    {
      rootDir: './services/my-express-service',
      routes: ['/auth/.*'],
    },
  ],
};
```

See the [Configuration](configuration.md) page details of the available
service configuration options.
