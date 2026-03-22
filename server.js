import 'dotenv/config';
import app from './app.js';
import logger from './logger.js';
import { testConnection, closePool } from './db_config/db_manager.js';

const PORT = process.env.PORT || 8091;
let server;

async function start() {
  await testConnection();
  server = app.listen(PORT, () => {
    logger.info('Server listening on port %d', PORT);
  });
}

async function shutdown() {
  logger.info('Shutting down...');
  server?.close();
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
