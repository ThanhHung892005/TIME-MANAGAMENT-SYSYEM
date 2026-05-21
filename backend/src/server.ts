import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import { startAutoOverdueJob } from './jobs/autoOverdue';

const PORT = parseInt(env.PORT, 10);

async function main() {
  await prisma.$connect();
  logger.info('Database connected');

  startAutoOverdueJob();
  logger.info('Auto-overdue cron job started');

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
