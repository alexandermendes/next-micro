const { serve } = require('./serve');

(async () => {
  await serve();

  if (process.send) {
    process.send('ready');
  }
})();
