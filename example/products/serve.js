const http = require('http');

const requestListener = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });

  res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Local Dev Server</title>
      </head>
      <body>
        Hello, World!
      </body>
    </html>
  `);
};

const serve = () => {
  const port = process.env.PORT;
  const host = '127.0.0.1';
  const server = http.createServer(requestListener);

  server.listen(port, host, () => {
    console.log(`Products server is running on http://${host}:${port}`);
});
}

module.exports = { serve };
