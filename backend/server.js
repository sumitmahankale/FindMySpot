/* eslint-env node */
/* Deprecated legacy shim. Use ./src/app.js */
console.warn('[DEPRECATION] backend/server.js -> use backend/src/app.js');

if (require.main === module) {
  const app = require('./src/app');
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server (legacy shim) listening on ${PORT}`);
  });
}

module.exports = require('./src/app');
