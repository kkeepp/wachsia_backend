import express, { json } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './logger.js';
import userRouter from './routes/users.js';
import treeRouter from './routes/trees.js';
import scannedProductRouter from './routes/scanned_products.js';
import communityRouter from './routes/communities.js';
import postRouter from './routes/posts.js';
import commentRouter from './routes/comments.js';
import questRouter from './routes/quests.js';
import { errorHandler, notFoundHandler } from './middleware/error_handler.js';
import { healthCheck } from './db_config/db_manager.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(json());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(join(__dirname, 'uploads')));
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
app.use('/api/scanned-products', scannedProductRouter);
app.use('/api/communities', communityRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/quests', questRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
