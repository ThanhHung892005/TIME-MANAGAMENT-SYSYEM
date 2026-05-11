# Time Management System

Ứng dụng web quản lý thời gian cá nhân với Tasks, Calendar, Pomodoro Timer và Analytics.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## Tính Năng

| Module | Chức năng |
|--------|-----------|
| **Authentication** | Đăng ký / Đăng nhập bằng Email hoặc Google OAuth 2.0, JWT stateless |
| **Task Management** | CRUD task, subtask, tag, kéo-thả sắp xếp, lọc theo priority/status, duplicate |
| **Calendar** | Xem task theo tháng/tuần/ngày, kéo-thả đổi deadline trực tiếp trên lịch |
| **Pomodoro Timer** | 3 chế độ (Standard 25/5, Long 50/10, Custom), SVG progress, lịch sử session, link với task |
| **Analytics** | Biểu đồ hoàn thành task 7 ngày, thống kê Pomodoro, heatmap 12 tuần |
| **Export** | Xuất báo cáo CSV / JSON / PDF |
| **Keyboard Shortcuts** | `N` task mới, `D/T/C/P/A` điều hướng, `?` help |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** — styling
- **Zustand 5** — global state, **TanStack Query 5** — server state
- **React Hook Form** + **Zod** — form validation
- **react-big-calendar** + `withDragAndDrop` — calendar DnD
- **Recharts** — biểu đồ analytics
- **@dnd-kit** — kéo-thả task list

### Backend
- **Node.js** + **Express 5** + **TypeScript**
- **PostgreSQL 17** + **Prisma 5** — database & ORM
- **JWT** + **bcryptjs** — authentication
- **Passport.js** + **passport-google-oauth20** — Google OAuth
- **Zod** — request validation, **Winston** — logging
- **pdfkit** — PDF export (stream-based)

### DevOps
- **Docker Compose** — local production stack
- **GitHub Actions** — CI (test + typecheck) + CD (deploy Render + Vercel)

---

## Cấu Trúc Dự Án

```
Time Management System/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema: User, Task, Subtask, Tag, PomodoroSession
│   ├── src/
│   │   ├── config/                # env, database, passport
│   │   ├── controllers/           # auth, task, calendar, pomodoro, analytics
│   │   ├── middlewares/           # authenticate, errorHandler, validation
│   │   ├── routes/                # REST endpoints
│   │   ├── services/              # business logic + Zod schemas
│   │   ├── models/                # TaskFactory, sort strategies
│   │   └── utils/                 # jwt, export (CSV/JSON/PDF)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── tasks/             # TaskList, TaskCard, TaskForm, TaskFilters
│   │   │   ├── calendar/          # CalendarView
│   │   │   ├── pomodoro/          # PomodoroTimer, SessionHistory
│   │   │   ├── analytics/         # Charts, Heatmap, ExportButtons
│   │   │   └── layout/            # AppLayout, Sidebar, KeyboardShortcutsModal
│   │   ├── hooks/                 # useAuth, useTasks, usePomodoro, useKeyboardShortcuts
│   │   ├── pages/                 # Dashboard, Tasks, Calendar, Pomodoro, Analytics, Login, Register
│   │   ├── services/              # axios API clients
│   │   └── store/                 # Zustand stores
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/
    ├── ci.yml                     # test + typecheck on every push/PR
    └── deploy.yml                 # build → Docker Hub → Render + Vercel on main
```

---

## Bắt Đầu

### Yêu Cầu

- Node.js 20+
- PostgreSQL 17
- npm

### 1. Clone & Cài Đặt

```bash
git clone https://github.com/<your-username>/time-management-system.git
cd time-management-system

# Cài dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Cấu Hình Environment

```bash
# Backend
cp backend/.env.example backend/.env
```

Chỉnh sửa `backend/.env`:

```env
NODE_ENV=development
PORT=3002

DATABASE_URL=postgresql://postgres:<password>@localhost:5432/timemanagement

JWT_SECRET=your-secret-key-min-16-chars
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-session-secret

# Optional — Google OAuth
# GOOGLE_CLIENT_ID=...apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=...
```

### 3. Khởi Tạo Database

```bash
cd backend
npx prisma migrate deploy
```

### 4. Chạy Local (Dev)

```bash
# Terminal 1 — Backend
cd backend && npm run dev        # http://localhost:3002

# Terminal 2 — Frontend
cd frontend && npm run dev       # http://localhost:5173
```

---

## Chạy Bằng Docker

```bash
# Build và start toàn bộ stack (PostgreSQL + Backend + Frontend)
docker compose up -d

# Truy cập tại http://localhost

# Dừng
docker compose down

# Xem log
docker compose logs -f backend

# Rebuild sau khi sửa code
docker compose build && docker compose up -d
```

> Docker Compose tự tạo database, chạy migration và start tất cả services.

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Lấy profile |
| GET | `/api/auth/google` | Đăng nhập Google OAuth |
| GET | `/api/tasks` | Danh sách task |
| POST | `/api/tasks` | Tạo task mới |
| PATCH | `/api/tasks/:id` | Cập nhật task |
| DELETE | `/api/tasks/:id` | Xóa task |
| PATCH | `/api/tasks/reorder` | Sắp xếp lại task |
| POST | `/api/tasks/:id/duplicate` | Nhân bản task |
| GET | `/api/calendar/tasks` | Task theo khoảng thời gian |
| POST | `/api/pomodoro/start` | Bắt đầu session |
| PATCH | `/api/pomodoro/:id/end` | Kết thúc session |
| GET | `/api/analytics/summary` | Thống kê tổng hợp |
| GET | `/api/analytics/export/:format` | Export (csv/json/pdf) |
| GET | `/api/health` | Health check |

---

## Chạy Tests

```bash
# Backend (Jest 29 + ts-jest)
cd backend && npm test
# 22 tests: TaskFactory, sortStrategies, authService

# Frontend (Vitest 4)
cd frontend && npm test
# 20 tests: sortStrategies, usePomodoro (fake timers + mock AudioContext)
```

---

## CI/CD

| Trigger | Pipeline |
|---------|----------|
| Push / PR vào bất kỳ branch | `ci.yml` — typecheck + test cả backend lẫn frontend |
| Push vào `main` | `deploy.yml` — build Docker image → Docker Hub → deploy Render (backend) + Vercel (frontend) |

Xem hướng dẫn thiết lập secrets tại [`.github/SECRETS.md`](.github/SECRETS.md).

---

## Keyboard Shortcuts

| Phím | Hành động |
|------|-----------|
| `N` | Tạo task mới |
| `D` | Dashboard |
| `T` | Tasks |
| `C` | Calendar |
| `P` | Pomodoro |
| `A` | Analytics |
| `?` | Xem tất cả shortcuts |

---

## Kích Hoạt Google OAuth (Tùy Chọn)

1. Vào [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Tạo **OAuth 2.0 Client ID** → Web application
3. Thêm Authorized redirect URI: `http://localhost:3002/api/auth/google/callback`
4. Điền vào `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=...
   ```
5. Restart backend. Nếu không cấu hình, route `/api/auth/google` trả `503` gracefully.

---

## License

MIT
