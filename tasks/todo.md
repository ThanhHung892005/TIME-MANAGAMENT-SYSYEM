# Tasks: Fix sendOtpLimiter — Composite Key (IP + Email)

## Task 1: Fix sendOtpLimiter keyGenerator

**Description:** Sửa `sendOtpLimiter` trong `rateLimiter.ts` để dùng composite key `IP:email` thay vì chỉ IP.

**Acceptance criteria:**
- [ ] `sendOtpLimiter` dùng `keyGenerator` trả về `${req.ip}:${req.body.email}`
- [ ] Nếu `req.body.email` undefined → fallback về IP (an toàn)
- [ ] Các limiter khác giữ nguyên không đổi

**Verification:**
- [ ] Code compiles: `pnpm build`

**Files likely touched:**
- `backend/src/middlewares/rateLimiter.ts`

**Estimated scope:** Small — 1 file, 5-10 dòng thay đổi

---

## Task 2: Viết unit test cho rateLimiter

**Description:** Viết test cho composite key behavior của `sendOtpLimiter`.

**Acceptance criteria:**
- [ ] Test: 2 request cùng IP, khác email → tạo 2 key khác nhau
- [ ] Test: 3 request cùng IP, cùng email → bị block ở request thứ 4
- [ ] Test: request thứ 4 với email mới → không bị block (key mới)

**Verification:**
- [ ] Tests pass: `pnpm test -- --grep "rateLimiter"`

**Files likely touched:**
- `backend/src/__tests__/middlewares/rateLimiter.test.ts` (file mới)

**Dependencies:** Task 1

**Estimated scope:** Small — viết file test mới 1-2 file
