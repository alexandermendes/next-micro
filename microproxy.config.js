const path = require('path');

module.exports = {
  port: 3000,
  autostart: true,
  services: [
    {
      name: 'products',
      port: 3001,
      script: path.join(__dirname, 'example', 'products', 'start.js'),
      routes: ['/products/.*'],
      ttl: 60000,
    },
  ],
}
