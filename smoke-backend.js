// Simple backend smoke test script
// Starts the Express app on a random port then hits health endpoints

const http = require('http');
const path = require('path');
const app = require(path.join(__dirname, 'backend', 'src', 'app'));

function get(path, port) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { data = JSON.parse(data); } catch (_) {}
        resolve({ path, status: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
    req.end();
  });
}

(async () => {
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const results = {};
    results.health = await get('/api/health', port);
    results.dbHealth = await get('/api/health/db', port);
    results.test = await get('/api/test', port);
    results.root = await get('/', port);

    console.log('SMOKE_BACKEND_RESULTS_START');
    console.log(JSON.stringify(results, null, 2));
    console.log('SMOKE_BACKEND_RESULTS_END');

    const failed = Object.values(results).some(r => r.error || (r.status && r.status >= 400));
    server.close(() => process.exit(failed ? 1 : 0));
  });
})();
