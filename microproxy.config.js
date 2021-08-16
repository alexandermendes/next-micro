const path = require('path');

module.exports = {
  port: 3000,
  services: [
    {
      name: 'products',
      port: 3001,
      start: path.join(__dirname, 'example', 'products', 'start.js'),
      routes: ['/products/.*'],
    },
  ],
}
