const http = require('http');

const requestListener = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.end(JSON.stringify({ message: 'Hello, World!' }));
};

const serve = () => {
  const port = process.env.PORT;
  const host = '127.0.0.1';
  const server = http.createServer(requestListener);

  server.listen(port, host, () => {
    console.log(`API server is running on http://${host}:${port}`);
});
}

module.exports = { serve };
