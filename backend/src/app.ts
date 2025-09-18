import express from 'express';
import cors from 'cors';
import { citizenRouter } from './citizen_requests/router.js';
import { proRouter } from './pro_subscriptions/router.js';
import { logger } from './common/logger.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/citizen', citizenRouter);
app.use('/pro', proRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error('Bilinmeyen hata');
  logger.error('request.error', { message: error.message });
  res.status(400).json({ error: error.message });
});
