import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import { startAutoOverdueJob } from './jobs/autoOverdue';
import cron from 'node-cron';
import { checkAndCreateNotifications } from './services/notificationService';
import notificationRouter from './routes/notificationRoutes';
import { taskEvents, TASK_EVENTS, OverdueTaskPayload } from './events/taskEvents';
import { sendOverdueAlerts } from './services/pushNotificationService';

// Routes
app.use('/api/notifications', notificationRouter);

// Route test - xóa sau khi test xong
app.get('/api/test-notifications', async (req, res) => {
  await checkAndCreateNotifications();
  res.json({ message: 'Done' });
});

// Cron: kiểm tra notification mỗi 15 phút
cron.schedule('*/15 * * * *', () => {
  checkAndCreateNotifications();
});

const PORT = parseInt(env.PORT, 10);

async function main() {
  await prisma.$connect();
  logger.info('Database connected');

  // Lắng nghe event overdue từ Dev B
  taskEvents.on(TASK_EVENTS.TASKS_OVERDUE, async (tasks: OverdueTaskPayload[]) => {
    logger.info(`[Event] ${tasks.length} overdue tasks received`);
    await sendOverdueAlerts(tasks);
  });

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