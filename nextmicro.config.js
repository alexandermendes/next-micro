const path = require('path');

module.exports = {
  port: 3000,
  services: [
    {
      port: 3001,
      script: 'start.js',
      rootDir: path.join(__dirname, 'example', 'api'),
      routes: ['/api/.*'],
      ttl: 60000,
    },
  ],
}
