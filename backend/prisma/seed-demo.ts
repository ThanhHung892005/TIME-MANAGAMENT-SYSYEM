import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();
const USER_ID = 'cmq9bdv5m0000xi7jit753vs9';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
const daysLater = (d: number) => new Date(now.getTime() + d * 86400000);

async function main() {
  // Clear existing data for this user
  await prisma.pomodoroSession.deleteMany({ where: { userId: USER_ID } });
  await prisma.tagsOnTasks.deleteMany({ where: { task: { userId: USER_ID } } });
  await prisma.subtask.deleteMany({ where: { task: { userId: USER_ID } } });
  await prisma.task.deleteMany({ where: { userId: USER_ID } });
  await prisma.tag.deleteMany({ where: { userId: USER_ID } });
  await prisma.notification.deleteMany({ where: { userId: USER_ID } });

  // Tags
  const [tagWork, tagStudy, tagPersonal, tagHealth] = await Promise.all([
    prisma.tag.create({ data: { name: 'Work', color: '#3B82F6', userId: USER_ID } }),
    prisma.tag.create({ data: { name: 'Study', color: '#8B5CF6', userId: USER_ID } }),
    prisma.tag.create({ data: { name: 'Personal', color: '#10B981', userId: USER_ID } }),
    prisma.tag.create({ data: { name: 'Health', color: '#EF4444', userId: USER_ID } }),
  ]);

  // Tasks
  const tasks = await Promise.all([
    // COMPLETED tasks (past)
    prisma.task.create({
      data: {
        title: 'Thiết kế UI Dashboard',
        description: 'Thiết kế giao diện Dashboard cho ứng dụng quản lý thời gian',
        priority: Priority.HIGH,
        status: Status.COMPLETED,
        deadline: daysAgo(5),
        order: 0,
        userId: USER_ID,
        subtasks: {
          create: [
            { title: 'Phác thảo wireframe', completed: true, order: 0 },
            { title: 'Thiết kế mockup Figma', completed: true, order: 1 },
            { title: 'Review với team', completed: true, order: 2 },
          ],
        },
        tags: { create: [{ tagId: tagWork.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement Authentication API',
        description: 'Xây dựng JWT auth với register/login/logout endpoints',
        priority: Priority.HIGH,
        status: Status.COMPLETED,
        deadline: daysAgo(8),
        order: 1,
        userId: USER_ID,
        subtasks: {
          create: [
            { title: 'Tạo register endpoint', completed: true, order: 0 },
            { title: 'Tạo login endpoint', completed: true, order: 1 },
            { title: 'Middleware JWT verify', completed: true, order: 2 },
            { title: 'Unit tests', completed: true, order: 3 },
          ],
        },
        tags: { create: [{ tagId: tagWork.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Đọc sách Clean Code',
        description: 'Đọc và ghi chú các chương quan trọng',
        priority: Priority.MEDIUM,
        status: Status.COMPLETED,
        deadline: daysAgo(3),
        order: 2,
        userId: USER_ID,
        subtasks: {
          create: [
            { title: 'Chương 1-3: Naming & Functions', completed: true, order: 0 },
            { title: 'Chương 4-6: Comments & Formatting', completed: true, order: 1 },
          ],
        },
        tags: { create: [{ tagId: tagStudy.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Tập gym buổi sáng',
        priority: Priority.LOW,
        status: Status.COMPLETED,
        deadline: daysAgo(1),
        order: 3,
        userId: USER_ID,
        tags: { create: [{ tagId: tagHealth.id }] },
      },
    }),

    // IN_PROGRESS tasks
    prisma.task.create({
      data: {
        title: 'Xây dựng tính năng Calendar',
        description: 'Tích hợp react-big-calendar với drag & drop deadline',
        priority: Priority.HIGH,
        status: Status.IN_PROGRESS,
        deadline: daysLater(2),
        order: 4,
        userId: USER_ID,
        subtasks: {
          create: [
            { title: 'Cài đặt react-big-calendar', completed: true, order: 0 },
            { title: 'Kết nối API lấy tasks theo ngày', completed: true, order: 1 },
            { title: 'Implement drag & drop', completed: false, order: 2 },
            { title: 'Test trên mobile', completed: false, order: 3 },
          ],
        },
        tags: { create: [{ tagId: tagWork.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Học TypeScript nâng cao',
        description: 'Generic types, conditional types, mapped types',
        priority: Priority.MEDIUM,
        status: Status.IN_PROGRESS,
        deadline: daysLater(5),
        order: 5,
        userId: USER_ID,
        subtasks: {
          create: [
            { title: 'Generic types', completed: true, order: 0 },
            { title: 'Conditional types', completed: false, order: 1 },
            { title: 'Utility types', completed: false, order: 2 },
          ],
        },
        tags: { create: [{ tagId: tagStudy.id }] },
      },
    }),

    // TODO tasks (upcoming deadlines)
    prisma.task.create({
      data: {
        title: 'Viết báo cáo tháng 6',
        description: 'Tổng hợp kết quả công việc tháng 6, đề xuất kế hoạch tháng 7',
        priority: Priority.HIGH,
        status: Status.TODO,
        deadline: daysLater(1),
        order: 6,
        userId: USER_ID,
        tags: { create: [{ tagId: tagWork.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Ôn tập Docker & CI/CD',
        description: 'Review Dockerfile, docker-compose, GitHub Actions workflow',
        priority: Priority.MEDIUM,
        status: Status.TODO,
        deadline: daysLater(3),
        order: 7,
        userId: USER_ID,
        subtasks: {
          create: [
            { title: 'Docker multi-stage build', completed: false, order: 0 },
            { title: 'docker-compose networks', completed: false, order: 1 },
            { title: 'GitHub Actions matrix', completed: false, order: 2 },
          ],
        },
        tags: { create: [{ tagId: tagStudy.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Mua quà sinh nhật cho bạn',
        priority: Priority.HIGH,
        status: Status.TODO,
        deadline: daysLater(4),
        order: 8,
        userId: USER_ID,
        tags: { create: [{ tagId: tagPersonal.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Khám sức khỏe định kỳ',
        priority: Priority.MEDIUM,
        status: Status.TODO,
        deadline: daysLater(7),
        order: 9,
        userId: USER_ID,
        tags: { create: [{ tagId: tagHealth.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Refactor Pomodoro service',
        description: 'Tách logic business ra service layer, thêm error handling',
        priority: Priority.LOW,
        status: Status.TODO,
        deadline: daysLater(10),
        order: 10,
        userId: USER_ID,
        tags: { create: [{ tagId: tagWork.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup monitoring với Sentry',
        description: 'Tích hợp Sentry error tracking cho frontend và backend',
        priority: Priority.LOW,
        status: Status.TODO,
        deadline: daysLater(14),
        order: 11,
        userId: USER_ID,
        tags: { create: [{ tagId: tagWork.id }] },
      },
    }),
  ]);

  // Pomodoro Sessions — spread over last 14 days for heatmap & charts
  const sessionData: Array<{ startedAt: Date; endedAt: Date; taskId?: string }> = [];

  const completedTaskIds = [tasks[0].id, tasks[1].id, tasks[2].id, tasks[3].id];
  const inProgressTaskIds = [tasks[4].id, tasks[5].id];

  // Past sessions (14 days)
  for (let day = 14; day >= 1; day--) {
    const count = day % 3 === 0 ? 1 : day % 2 === 0 ? 3 : 2;
    for (let s = 0; s < count; s++) {
      const start = new Date(daysAgo(day).getTime() + (9 + s * 2) * 3600000);
      const end = new Date(start.getTime() + 25 * 60000);
      const taskId = completedTaskIds[Math.floor(Math.random() * completedTaskIds.length)];
      sessionData.push({ startedAt: start, endedAt: end, taskId });
    }
  }

  // Today sessions
  for (let s = 0; s < 3; s++) {
    const start = new Date(now.getTime() - (3 - s) * 7200000);
    const end = new Date(start.getTime() + 25 * 60000);
    const taskId = inProgressTaskIds[s % 2];
    sessionData.push({ startedAt: start, endedAt: end, taskId });
  }

  await Promise.all(
    sessionData.map(({ startedAt, endedAt, taskId }) =>
      prisma.pomodoroSession.create({
        data: { duration: 25, type: 'work', userId: USER_ID, startedAt, endedAt, taskId },
      }),
    ),
  );

  console.log(`✅ Seed done:
  - ${tasks.length} tasks (4 completed, 2 in-progress, 6 todo)
  - ${sessionData.length} pomodoro sessions
  - 4 tags`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
