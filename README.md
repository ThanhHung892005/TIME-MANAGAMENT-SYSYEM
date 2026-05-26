# Time Management System

Ứng dụng web quản lý thời gian cá nhân giúp người dùng quản lý công việc, theo dõi thời gian tập trung bằng Pomodoro và phân tích hiệu suất làm việc thông qua dashboard trực quan.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

# Features

| Module | Chức năng |
|--------|-----------|
| **Authentication** | Đăng ký / Đăng nhập Email, Google OAuth 2.0, JWT Authentication |
| **Task Management** | CRUD task/subtask/tag, recurring task, overdue detection, drag-drop reorder, filter/sort/search, bulk actions |
| **Calendar** | Month / Week / Day view, hiển thị deadline và overdue task |
| **Pomodoro Timer** | Standard / Long / Custom mode, pause/resume session, session history, task linking |
| **Analytics Dashboard** | Task completion chart, focus time chart, overdue statistics, priority distribution, productivity heatmap |
| **Notification System** | Web notification cho Pomodoro completed, deadline reminder và overdue task |
| **Export System** | Export CSV / JSON |
| **User Settings** | Theme mode, timezone, Pomodoro duration, notification preferences |
| **Keyboard Shortcuts** | `N`, `D`, `T`, `C`, `P`, `A`, `?` |

---

# Business Rules

- Task tự động chuyển sang `OVERDUE` nếu vượt deadline và chưa hoàn thành.
- Chỉ cho phép một Pomodoro session chạy tại một thời điểm.
- Recurring task tự động tạo task tiếp theo khi completed.
- Mọi dữ liệu đều thuộc ownership của một user cụ thể.
- Cascade delete cho task/subtask/session liên quan.
- Validation được xử lý bằng Zod ở frontend và backend.

---

# Tech Stack

## Frontend
- React 19
- TypeScript
- Vite 8
- Tailwind CSS v4
- Zustand
- TanStack Query
- React Hook Form + Zod
- react-big-calendar
- Recharts
- @dnd-kit

---

## Backend
- Node.js
- Express 5
- TypeScript
- PostgreSQL 17
- Prisma ORM
- JWT
- bcryptjs
- Passport.js
- passport-google-oauth20
- Zod

---

## DevOps
- Docker Compose
- GitHub Actions
- Render
- Vercel

---

# Project Structure

```bash
Time Management System/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── tasks/
│   │   │   ├── calendar/
│   │   │   ├── pomodoro/
│   │   │   ├── analytics/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Today/
│   │   │   ├── Upcoming/
│   │   │   ├── Completed/
│   │   │   ├── Tasks/
│   │   │   ├── Calendar/
│   │   │   ├── Pomodoro/
│   │   │   ├── Analytics/
│   │   │   ├── Settings/
│   │   │   ├── Login/
│   │   │   └── Register/
│   │   ├── services/
│   │   └── store/
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
└── .github/workflows/
```

---

# Database Models

## Users
- id
- email
- password
- googleId
- theme
- timezone
- pomodoroDuration

## Tasks
- id
- title
- description
- priority
- status
- deadline
- orderIndex
- isRecurring
- recurringType
- userId

## Subtasks
- id
- title
- status
- taskId

## Tags
- id
- name
- color
- userId

## PomodoroSessions
- id
- startTime
- endTime
- duration
- type
- status
- taskId
- userId

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Thông tin user |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Reset mật khẩu |
| GET | `/api/auth/google` | Google OAuth |

---

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Danh sách task |
| GET | `/api/tasks/:id` | Chi tiết task |
| POST | `/api/tasks` | Tạo task |
| PATCH | `/api/tasks/:id` | Cập nhật task |
| DELETE | `/api/tasks/:id` | Xóa task |
| PATCH | `/api/tasks/reorder` | Reorder task |
| POST | `/api/tasks/:id/duplicate` | Duplicate task |
| GET | `/api/tasks/search` | Search task |
| GET | `/api/tasks/today` | Task hôm nay |
| GET | `/api/tasks/upcoming` | Task sắp tới |
| GET | `/api/tasks/completed` | Task đã hoàn thành |
| GET | `/api/tasks/overdue` | Task overdue |
| POST | `/api/tasks/bulk-update` | Bulk update |
| DELETE | `/api/tasks/bulk-delete` | Bulk delete |

---

## Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/:id/subtasks` | Tạo subtask |
| PATCH | `/api/subtasks/:id` | Update subtask |
| DELETE | `/api/subtasks/:id` | Xóa subtask |

---

## Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | Danh sách tag |
| POST | `/api/tags` | Tạo tag |
| PATCH | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Xóa tag |

---

## Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/tasks` | Task theo khoảng thời gian |

---

## Pomodoro

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pomodoro/start` | Start session |
| PATCH | `/api/pomodoro/:id/pause` | Pause session |
| PATCH | `/api/pomodoro/:id/resume` | Resume session |
| PATCH | `/api/pomodoro/:id/end` | End session |
| PATCH | `/api/pomodoro/:id/interrupt` | Interrupt session |
| GET | `/api/pomodoro/history` | Session history |

---

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Tổng quan analytics |
| GET | `/api/analytics/focus-time` | Focus time statistics |
| GET | `/api/analytics/completion-rate` | Completion rate |
| GET | `/api/analytics/heatmap` | Productivity heatmap |
| GET | `/api/analytics/priority-distribution` | Priority distribution |

---

## Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/csv` | Export CSV |
| GET | `/api/export/json` | Export JSON |

---

## Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | User settings |
| PATCH | `/api/settings` | Update settings |

---

# Getting Started

## Requirements
- Node.js 20+
- PostgreSQL 17+
- npm

---

# Installation

```bash
git clone https://github.com/<your-username>/time-management-system.git

cd time-management-system
```

---

# Backend Setup

```bash
cd backend
npm install
```

Tạo file `.env`

```env
NODE_ENV=development
PORT=3002

DATABASE_URL=postgresql://postgres:<password>@localhost:5432/timemanagement

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

---

# Database Migration

```bash
cd backend

npx prisma migrate dev
```

---

# Run Development

## Backend
```bash
cd backend
npm run dev
```

## Frontend
```bash
cd frontend
npm run dev
```

---

# Docker

```bash
# 1. Tạo file .env từ template
cp .env.example .env

# 2. Điền password thật vào .env (POSTGRES_PASSWORD, JWT_SECRET, SESSION_SECRET)

# 3. Build và start toàn bộ stack (PostgreSQL + Backend + Frontend)
docker compose up -d

# Truy cập tại http://localhost
```

```bash
# Dừng
docker compose down

# Xem log
docker compose logs -f backend

# Rebuild sau khi sửa code
docker compose build && docker compose up -d
```

> Docker Compose tự đọc file `.env` ở root, tạo database, chạy migration và start tất cả services.

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
docker compose down
```

---

# Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | New Task |
| `D` | Dashboard |
| `T` | Tasks |
| `C` | Calendar |
| `P` | Pomodoro |
| `A` | Analytics |
| `?` | Help |

---

# Testing

## Backend
```bash
cd backend
npm test
```

## Frontend
```bash
cd frontend
npm test
```

---

# Future Improvements

- Team Collaboration
- AI Task Suggestion
- AI Productivity Analytics
- Real-time Sync
- Mobile Application

---

# License

MIT