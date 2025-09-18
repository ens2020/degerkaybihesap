import { app } from './app.js';
import { logger } from './common/logger.js';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  logger.info('server.started', { port });
});
