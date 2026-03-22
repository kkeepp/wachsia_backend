import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './logger.js';
import userRouter from './routes/users.js';
import treeRouter from './routes/trees.js';
import { errorHandler, notFoundHandler } from './middleware/error_handler.js';
import { healthCheck } from './db_config/db_manager.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(json());
app.use(pinoHttp({ logger, autoLogging: false }));

app.get('/health', async (req, res) => {
  try {
    await healthCheck();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/users', userRouter);
app.use('/api/trees', treeRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
