# Time Management System

Ứng dụng web quản lý thời gian cá nhân: tasks, calendar, Pomodoro timer, analytics.

---

## Stack

| Layer | Tech | Phiên bản thực tế |
|-------|------|-------------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS v4 | React 19.2 / Vite 8.0 / Tailwind 4.2 |
| State | Zustand (UI/global) + TanStack Query (server) | Zustand 5.0 / TanStack Query 5 |
| Forms | React Hook Form + Zod | — |
| Calendar | react-big-calendar + DnD addon | — |
| Charts | Recharts | — |
| Backend | Node.js + Express 5 + TypeScript 6 | Express 5.2 |
| Database | PostgreSQL 17 + Prisma 5 (ORM) | Prisma 5.22 |
| Auth | JWT + bcryptjs + passport-google-oauth20 | — |
| Tests | Jest 29 + ts-jest 29 (backend) / Vitest 4 (frontend) | — |
| Deploy | Docker Compose + GitHub Actions → Render + Vercel | — |

---

## Trạng Thái Dự Án — Tổng Quan

> **Trạng thái hiện tại: ✅ FEATURE COMPLETE** — tất cả 8 phase đã hoàn thành.
> App chạy local tại `localhost:5173` (frontend) + `localhost:3002` (backend) + PostgreSQL `localhost:5432`.

---

## Chi Tiết Từng Phase

### ✅ Phase 0 — Project Setup
- Backend: Express 5 + TypeScript + Prisma 5, Winston logger, Zod env validation
- Frontend: Vite 8 + React 19 + Tailwind v4, Axios interceptors, TanStack Query
- DB schema: User, Task, Subtask, Tag, TagsOnTasks, PomodoroSession

### ✅ Phase 1 — Authentication
- Backend: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/profile`
- Frontend: trang Login, Register, ProtectedRoute, Sidebar, AppLayout
- Store: `userStore` (Zustand + localStorage token), `useAuth` hook

### ✅ Phase 2 — Task Management
- Backend: CRUD + reorder (`PATCH /api/tasks/reorder`) + duplicate + subtask endpoints
- Frontend: TaskList (DnD với @dnd-kit), TaskCard, TaskForm (modal), TaskFilters
- Patterns: Factory (`TaskFactory`), Strategy (`SortByDeadline` / `SortByPriority` / `SortByOrder`)

### ✅ Phase 3 — Calendar
- Backend: `GET /api/calendar/tasks?start=&end=`, `PATCH /api/calendar/tasks/:id/deadline`
- Frontend: react-big-calendar với 3 views (month/week/day), color-coded theo priority (đỏ/vàng/xanh)
- DnD trực tiếp trên calendar: `withDragAndDrop` addon, `onEventDrop` + `onEventResize` → `useUpdateDeadline`

### ✅ Phase 4 — Pomodoro Timer
- Backend: `POST /api/pomodoro/start`, `PATCH /api/pomodoro/:id/end`, `GET /api/pomodoro/history`
- Frontend: SVG circular progress, 3 modes (Standard 25/5, Long 50/10, Custom), Web Audio API beep, auto-switch work↔break, session history, link task

### ✅ Phase 5 — Analytics & Export
- Backend: summary stats, completion chart (7 ngày), pomodoro stats, heatmap (12 tuần)
- Export: CSV / JSON / **PDF** (`pdfkit`, stream-based) — Template Method pattern (`ReportExporter` → 3 subclass)
- Frontend: BarChart + LineChart (Recharts), pomodoro cards, 3 nút export

### ✅ Phase 6 — Docker
- `backend/Dockerfile` — multi-stage: build TS → node:20-alpine + openssl
- `frontend/Dockerfile` — multi-stage: build Vite → nginx:alpine
- `frontend/nginx.conf` — proxy `/api/*` → backend, SPA fallback, gzip, cache tĩnh 1 năm
- `docker-compose.yml` — PostgreSQL 17 + backend (port 3001) + frontend (port 80)

### ✅ Phase 7 — Keyboard Shortcuts & Unit Tests
**Keyboard shortcuts** (`react-hotkeys-hook`):
- `N` → new task, `D` → dashboard, `T` → tasks, `C` → calendar, `P` → pomodoro, `A` → analytics, `?` → help modal
- `useKeyboardShortcuts` hook trong `AppLayout`, `KeyboardShortcutsModal` component

**Unit tests:**
- Backend (Jest 29 + ts-jest 29): 22 tests — `TaskFactory`, `sortStrategies`, `authService`
- Frontend (Vitest 4): 20 tests — `sortStrategies`, `usePomodoro` (fake timers + mock AudioContext)

### ✅ Phase 8 — CI/CD + OAuth Google
**CI/CD (`.github/workflows/`):**
- `ci.yml` — trigger mọi push/PR: PostgreSQL service, typecheck, test+coverage (backend + frontend)
- `deploy.yml` — trigger push vào `main`: build Docker → Docker Hub, deploy Render (backend) + Vercel (frontend)

**OAuth Google (`passport-google-oauth20`):**
- DB: `User.password` nullable + `User.googleId String? @unique` (migration: `20260509000000_add_google_oauth`)
- Backend: `GET /api/auth/google` → redirect Google, `GET /api/auth/google/callback` → JWT → redirect frontend
- Stateless: session chỉ dùng cho OAuth state param, sau callback trả token qua URL
- Frontend: `GoogleSignInButton` component, `/auth/callback` page nhận token, `Login` + `Register` có Google button

---

## Khởi Động

### Local (dev)
```bash
# Backend
cd backend && npm run dev          # http://localhost:3002

# Frontend
cd frontend && npm run dev         # http://localhost:5173
```

### Docker (production)
```bash
docker compose up -d               # http://localhost (port 80)
docker compose down
docker compose logs -f backend
docker compose build && docker compose up -d   # sau khi sửa code
```

### Database (local)
```
Host: localhost:5432
User: postgres / Password: 892005
DB:   timemanagement
```
PostgreSQL 17 tại `/Library/PostgreSQL/17/` — KHÔNG dùng Homebrew PG14 (broken).

---

## Kích Hoạt OAuth Google

1. Vào [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID → Web application
3. Authorized redirect URIs: `http://localhost:3002/api/auth/google/callback` (dev) + production URL
4. Uncomment và điền vào `backend/.env`:
```env
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
```
5. Restart backend. Nếu không cấu hình, route Google trả 503 gracefully (không crash).

---

## Kích Hoạt CI/CD (GitHub Actions)

Xem hướng dẫn secrets đầy đủ tại [`.github/SECRETS.md`](.github/SECRETS.md).
Cần thiết lập trong GitHub → Settings → Secrets and variables → Actions:

| Secret | Nguồn |
|--------|-------|
| `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` | hub.docker.com |
| `RENDER_BACKEND_DEPLOY_HOOK` | Render dashboard → Service → Settings |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | `vercel link` trong thư mục `frontend/` |

---

## Quyết Định Quan Trọng

| Quyết định | Lý do |
|-----------|-------|
| Prisma 5 thay vì 7 | Prisma 7 có breaking change — bỏ `url` trong datasource |
| TypeScript 6 (giữ nguyên) | TS 6 deprecate `baseUrl` nhưng vẫn build được Vite; không downgrade để tránh regressions |
| `binaryTargets` trong schema | Prisma cần binary riêng cho Alpine Linux (musl/openssl-3.0.x) khi chạy Docker |
| Calendar DnD dùng interop shim | `withDragAndDrop` là CJS với `exports.__esModule: true` — Vite không tự unwrap; cần `.default ?? module` + `optimizeDeps.include` |
| PDF dùng `pdfkit` thay pdfmake | Stream-based (`Buffer.concat`), không cần CDN font, hoạt động thuần Node — pdfmake cần browser globals |
| OAuth stateless (không dùng session) | Passport chỉ cần session cho OAuth state param; sau callback issue JWT và redirect — không lưu session server-side |
| Jest 29 + ts-jest 29 (không upgrade 30) | ts-jest 29 không tương thích Jest 30 (`jest-util` missing) — downgrade toàn bộ ecosystem để đồng bộ |
| `Express.User extends AuthPayload` (global augment) | Passport mở rộng `req.user: Express.User`; khai báo augmentation trong `types/index.ts` giải quyết xung đột TypeScript với `AuthRequest` |
| Vitest setup dùng `expect.extend()` thủ công | `import '@testing-library/jest-dom'` cần global `expect` (chỉ có khi `globals: true`); thay bằng explicit extend tránh config phức tạp |
| `user postgres` (docker-compose) | `.env` local dùng `postgres`; docker-compose DB cũng dùng `postgres` — nhất quán giữa local và Docker |

---

## Bước Tiếp Theo (Nếu Muốn Mở Rộng)

Những tính năng này **chưa implement** — dự án hiện tại feature complete, đây là ý tưởng mở rộng.

### Nhóm 1 — Giá trị cao, không quá phức tạp

- [ ] **Recurring Tasks** — task lặp lại theo ngày/tuần/tháng; schema thêm `recurrence` enum + `nextDueAt` vào `Task`; hiển thị tự động trên Calendar
- [ ] **Push Notifications / Nhắc nhở** — browser push notification khi task sắp đến deadline hoặc Pomodoro kết thúc; Web Push API + Service Worker frontend; backend: bảng `Reminder` + `node-cron`
- [ ] **Projects / Nhóm task** — gom task vào project, theo dõi tiến độ; schema thêm bảng `Project` (name, color, deadline); Task thuộc 1 project; sidebar hiện danh sách project
- [ ] **Time Tracking thủ công** — bấm start/stop timer trên bất kỳ task nào (ngoài Pomodoro); tái dùng bảng `PomodoroSession` với thêm `type: POMODORO | MANUAL`; hiển thị tổng giờ làm mỗi task trên TaskCard

### Nhóm 2 — UX cải thiện đáng kể

- [ ] **Quick Add** — nhấn `Ctrl+K` → input nổi lên, nhập tên + deadline bằng natural language ("tomorrow 3pm"); parse với `chrono-node`
- [ ] **Habit Tracker** — track thói quen hàng ngày riêng khỏi task; schema: `Habit`, `HabitEntry` (date + completed); hiển thị streak + heatmap tái dùng component Analytics
- [ ] **Focus Mode** — ẩn sidebar, chỉ hiện 1 task + Pomodoro timer; phím tắt `F`
- [ ] **Daily Notes / Journal** — ghi chú theo ngày, attach vào calendar; schema: `DailyNote` (date, content markdown); editor dùng `@uiw/react-md-editor`

### Nhóm 3 — Tính năng lớn hơn

- [ ] **Google Calendar Sync** — đồng bộ 2 chiều task ↔ Google Calendar event; dùng Google Calendar API (đã có OAuth, chỉ cần thêm scope `calendar`)
- [ ] **AI Task Prioritization** — gợi ý thứ tự ưu tiên task dựa trên deadline + lịch sử Pomodoro; gọi Claude API với context task list
- [ ] **Team Collaboration** — invite người khác vào project, assign task; schema: `ProjectMember`, `TaskAssignee`
- [ ] **Gamification** — streak làm việc, XP, badges khi hoàn thành Pomodoro/task; tính toán từ dữ liệu có sẵn, không cần schema phức tạp

### Kỹ thuật / Hạ tầng

- [ ] **E2E tests** — Playwright: test flow đăng nhập, tạo task, timer Pomodoro
- [ ] **Rate limiting** — `express-rate-limit` trên `/api/auth/*` để chống brute force
- [ ] **Refresh token** — cơ chế rotate JWT, hiện tại token expire sau 7d không renew
- [ ] **Mobile app** — React Native hoặc PWA (manifest.json + offline cache)
- [ ] **OAuth thêm provider** — GitHub, Microsoft (`passport-github2`, `passport-microsoft`)
- [ ] **Monitoring** — Sentry error tracking, Grafana/Prometheus metrics cho production
