import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();
const USER_ID = 'cmq9bdv5m0000xi7jit753vs9';

function dateAt(year: number, month: number, day: number, hour = 9) {
  return new Date(year, month - 1, day, hour, 0, 0);
}

async function main() {
  // Get existing tags
  const tags = await prisma.tag.findMany({ where: { userId: USER_ID } });
  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  const calendarTasks = [
    // === JUNE 2026 (past dates) ===
    {
      title: 'Họp kick-off dự án Q3',
      description: 'Cuộc họp lên kế hoạch dự án quý 3 với team',
      priority: Priority.HIGH,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 2, 10),
      tagName: 'Work',
    },
    {
      title: 'Nộp báo cáo tiến độ sprint 1',
      priority: Priority.HIGH,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 3, 17),
      tagName: 'Work',
    },
    {
      title: 'Ôn thi chứng chỉ AWS',
      priority: Priority.MEDIUM,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 4, 20),
      tagName: 'Study',
    },
    {
      title: 'Chạy bộ buổi sáng 5km',
      priority: Priority.LOW,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 5, 6),
      tagName: 'Health',
    },
    {
      title: 'Review PR của teammates',
      priority: Priority.MEDIUM,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 6, 14),
      tagName: 'Work',
    },
    {
      title: 'Đặt lịch khám nha khoa',
      priority: Priority.LOW,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 7, 11),
      tagName: 'Health',
    },
    {
      title: 'Hoàn thiện tài liệu API',
      description: 'Viết Swagger docs cho tất cả endpoints',
      priority: Priority.HIGH,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 9, 18),
      tagName: 'Work',
    },
    {
      title: 'Đọc sách "Deep Work"',
      priority: Priority.LOW,
      status: Status.COMPLETED,
      deadline: dateAt(2026, 6, 10, 21),
      tagName: 'Study',
    },

    // === JUNE — upcoming (today is June 11) ===
    {
      title: 'Demo sản phẩm cho khách hàng',
      description: 'Chuẩn bị slide + demo live tính năng mới',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 12, 14),
      tagName: 'Work',
    },
    {
      title: 'Nộp form đăng ký học bổng',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 13, 23),
      tagName: 'Study',
    },
    {
      title: 'Họp 1-1 với mentor',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 14, 10),
      tagName: 'Work',
    },
    {
      title: 'Mua sắm đồ dùng gia đình',
      priority: Priority.LOW,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 14, 16),
      tagName: 'Personal',
    },
    {
      title: 'Triển khai lên staging server',
      description: 'Deploy phiên bản v1.2.0 lên môi trường staging',
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      deadline: dateAt(2026, 6, 15, 12),
      tagName: 'Work',
    },
    {
      title: 'Làm bài tập lớn môn CNPM',
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      deadline: dateAt(2026, 6, 16, 23),
      tagName: 'Study',
    },
    {
      title: 'Luyện tập yoga',
      priority: Priority.LOW,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 17, 7),
      tagName: 'Health',
    },
    {
      title: 'Viết unit tests cho TaskService',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 18, 18),
      tagName: 'Work',
    },
    {
      title: 'Gặp gỡ nhóm học tập',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 19, 15),
      tagName: 'Study',
    },
    {
      title: 'Sửa bugs sprint 2',
      description: 'Fix các issues được report từ QA team',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 20, 17),
      tagName: 'Work',
    },
    {
      title: 'Gọi điện hỏi thăm gia đình',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 21, 19),
      tagName: 'Personal',
    },
    {
      title: 'Chạy bộ marathon nhỏ 10km',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 22, 6),
      tagName: 'Health',
    },
    {
      title: 'Cập nhật CV & LinkedIn',
      priority: Priority.LOW,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 23, 20),
      tagName: 'Personal',
    },
    {
      title: 'Nghiên cứu Redis caching',
      description: 'Tìm hiểu cách cache API response với Redis',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 24, 21),
      tagName: 'Study',
    },
    {
      title: 'Phát hành phiên bản v1.2.0',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 25, 10),
      tagName: 'Work',
    },
    {
      title: 'Đi xem phim với bạn bè',
      priority: Priority.LOW,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 26, 19),
      tagName: 'Personal',
    },
    {
      title: 'Ôn tập Kubernetes cơ bản',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 27, 20),
      tagName: 'Study',
    },
    {
      title: 'Báo cáo tổng kết tháng 6',
      description: 'Tổng hợp KPI và kết quả tháng 6',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 28, 17),
      tagName: 'Work',
    },
    {
      title: 'Đặt lịch du lịch hè',
      priority: Priority.LOW,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 29, 21),
      tagName: 'Personal',
    },
    {
      title: 'Kiểm tra sức khỏe định kỳ',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 6, 30, 9),
      tagName: 'Health',
    },

    // === JULY 2026 ===
    {
      title: 'Họp kick-off tháng 7',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 7, 1, 9),
      tagName: 'Work',
    },
    {
      title: 'Bắt đầu khóa học React Native',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 7, 3, 20),
      tagName: 'Study',
    },
    {
      title: 'Setup E2E tests với Playwright',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 7, 5, 17),
      tagName: 'Work',
    },
    {
      title: 'Đăng ký thi IELTS',
      priority: Priority.HIGH,
      status: Status.TODO,
      deadline: dateAt(2026, 7, 7, 12),
      tagName: 'Study',
    },
    {
      title: 'Tích hợp Sentry monitoring',
      priority: Priority.MEDIUM,
      status: Status.TODO,
      deadline: dateAt(2026, 7, 10, 15),
      tagName: 'Work',
    },
    {
      title: 'Nghỉ phép du lịch Đà Nẵng',
      priority: Priority.LOW,
      status: Status.TODO,
      deadline: dateAt(2026, 7, 15, 8),
      tagName: 'Personal',
    },
  ];

  let created = 0;
  let order = 20;

  for (const t of calendarTasks) {
    const tagId = tagMap[t.tagName];
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        deadline: t.deadline,
        order: order++,
        userId: USER_ID,
        ...(tagId ? { tags: { create: [{ tagId }] } } : {}),
      },
    });
    created++;
  }

  console.log(`✅ Calendar seed done: ${created} tasks added across June–July 2026`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
