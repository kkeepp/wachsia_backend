import logger from '../logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(status).json({ error: message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}
