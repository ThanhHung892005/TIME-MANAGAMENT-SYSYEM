# Plan: Fix sendOtpLimiter — Composite Key (IP + Email)

## Overview

Cải thiện `sendOtpLimiter` trong `rateLimiter.ts` để dùng **composite key `IP + email`** thay vì chỉ `IP`. Hiện tại cùng 1 IP gửi OTP cho 3 email khác nhau → chỉ gửi được 3 lần tổng. Sau improvement: mỗi email có 3 lần gửi OTP riêng trong 1 giờ.

## Architecture Decision

`express-rate-limit` hỗ trợ option `keyGenerator` để tạo key tùy chỉnh. Thay vì default key = IP, ta tạo key = `${IP}:${email}`.

## Task List

(Xem `tasks/todo.md`)

## Dependency Graph

```
rateLimiter.ts (keyGenerator)
  └── validation.ts (lấy email từ body sau validation)
  └── authRoutes.ts (áp dụng middleware)
```

## Files Touched

- `backend/src/middlewares/rateLimiter.ts` — thay đổi chính
- `backend/src/__tests__/middlewares/rateLimiter.test.ts` — viết test mới

## Risks

- `express-rate-limit` keyGenerator nhận `req` và trả về string — đơn giản, low risk
- Email có thể undefined nếu request chưa qua validation — cần fallback về IP

## Verification

- [ ] Unit test: verify composite key cho 2 email khác nhau từ cùng 1 IP → 2 counter riêng biệt
- [ ] Build passes: `pnpm build`
