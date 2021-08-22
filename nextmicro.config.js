const path = require('path');

module.exports = {
  port: 3000,
  autostart: true,
  services: [
    {
      rootDir: path.join(__dirname, 'example', 'frontend'),
      routes: ['/home'], // TODO: Determine automatically
    },
    {
      port: 3001,
      script: 'start.js',
      rootDir: path.join(__dirname, 'example', 'api'),
      routes: ['/api/.*'],
      ttl: 60000,
      env: {
        PORT: 3001,
      },
    },
  ],
}
