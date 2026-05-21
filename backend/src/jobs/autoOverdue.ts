import cron from 'node-cron';
import { taskService } from '../services/taskService';

// Runs every hour: marks TODO/IN_PROGRESS tasks past their deadline as OVERDUE.
//
// After marking, taskService emits TASK_EVENTS.TASKS_OVERDUE with payload OverdueTaskPayload[].
// Dev C registers a listener to send push notifications:
//
//   import { taskEvents, TASK_EVENTS } from '../events/taskEvents';
//   taskEvents.on(TASK_EVENTS.TASKS_OVERDUE, async (tasks: OverdueTaskPayload[]) => {
//     await pushNotificationService.sendOverdueAlerts(tasks);
//   });
//
// Register the listener before calling startAutoOverdueJob() in server.ts.
export function startAutoOverdueJob() {
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await taskService.markOverdueTasks();
      if (count > 0) {
        console.log(`[autoOverdue] Marked ${count} task(s) as OVERDUE`);
      }
    } catch (err) {
      console.error('[autoOverdue] Failed to mark overdue tasks:', err);
    }
  });
}
