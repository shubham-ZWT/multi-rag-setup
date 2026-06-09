# Feature: Email OTP Verification During Registration

## Overview
Mandatory email verification via 6-digit OTP during registration. Unverified users cannot log in or access protected resources. OTP expires in 5 minutes (configurable).

## Scope
**In scope:** `EmailOtp` model, `isVerified` field on User, 4 auth endpoints (register, verify-otp, resend-otp, login), EmailService, frontend auth pages
**Out of scope:** Social OAuth, SMS OTP, admin dashboard, widget changes, password reset

## Assumptions
- No email infrastructure exists — new EmailService with Nodemailer required
- Frontend has no auth pages — creating minimal `/register` and `/login`
- OTPs stored in dedicated table (different lifecycle than password reset tokens)
- Rate limiting via in-memory counter (no Redis for MVP)

---

## Codebase Context

### Relevant Files
| File | Relevance |
|------|-----------|
| `prisma/schema.prisma` | Add `isVerified` to User, add `EmailOtp` model |
| `src/services/auth.service.ts` | Modify register/login, add verifyOtp/resendOtp |
| `src/controllers/auth.controller.ts` | Add handlers, modify register/login responses |
| `src/routes/auth.routes.ts` | Add verify-otp and resend-otp routes |
| `src/utils/appError.ts` | Reuse AppError for OTP errors |
| `src/constants/env.ts` | Add EMAIL_* env vars to required check |
| `multirag-frontend/src/app/` | New register/login pages |
| `multirag-frontend/src/components/common/Navbar.tsx` | Add auth links |

### Data Models

**User changes:**
```prisma
isVerified  Boolean  @default(false) @map("is_verified")
emailOtps   EmailOtp[]
```

**New EmailOtp model:**
```prisma
model EmailOtp {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  otpHash   String   @map("otp_hash")
  purpose   String   @default("registration")
  expiresAt DateTime @map("expires_at")
  attempts  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId, purpose])
  @@map("email_otps")
}
```

### Patterns
- Error handling: Throw `AppError` from `src/utils/appError.ts`
- Async wrappers: Use `asyncHandler` from `src/utils/asyncHandler.ts`
- Response shape: `{ success: true, ...data }` or `{ message: '...' }`
- Auth routes are public (no verifyToken middleware)
- Services: class-based singletons, methods as arrow functions

---

## Implementation Plan

### 1. Database
- Add `isVerified` field to User model
- Create `EmailOtp` model with relation to User
- Run `npx prisma migrate dev --name add_email_otp_verification`

### 2. API Endpoints

**`POST /api/auth/register`** (modified)
- Body: `{ email, password, fullName }`
- Response (201): `{ message, userId }`
- Logic: Validate → check duplicate → hash password → create user (isVerified: false) → generate/store OTP → send email
- Errors: 400 (missing fields), 409 (duplicate email)

**`POST /api/auth/verify-otp`** (new)
- Body: `{ userId, otp }`
- Response (200): `{ success, message, token }`
- Logic: Find user → find unexpired OTP → check attempts → compare hash → mark verified → delete OTPs → return JWT
- Errors: 400 (invalid OTP), 404 (not found/no OTP), 410 (expired), 429 (too many attempts)

**`POST /api/auth/resend-otp`** (new)
- Body: `{ userId }`
- Response (200): `{ message }`
- Logic: Find user → check verified → rate limit check (60s) → delete old OTPs → generate/send new OTP
- Errors: 400 (already verified), 404 (not found), 429 (rate limited)

**`POST /api/auth/login`** (modified)
- Body: `{ email, password }` (unchanged)
- Response: If unverified → 403 with `{ error, requiresVerification: true, userId }`
- Logic: After password check, verify `user.isVerified` before issuing JWT

### 3. Services

**New `src/services/email.service.ts`:**
- `sendOtpEmail(to, otp, fullName?)` — sends HTML email with 6-digit code
- Uses nodemailer, reads config from EMAIL_* env vars

**New `src/utils/otp.ts`:**
- `generateOtp()` — 6-digit numeric string via crypto.randomInt
- `hashOtp(otp)` — SHA-256 hex digest
- Constants: `MAX_OTP_ATTEMPTS=5`, `OTP_EXPIRY_MINUTES=5`, `RESEND_COOLDOWN_SECONDS=60`

**Modified `src/services/auth.service.ts`:**
- `register()` — generate OTP after user creation, send email, return userId
- `login()` — check isVerified before JWT generation
- New `verifyOtp(userId, otp)` and `resendOtp(userId)` methods

### 4. Frontend

**`/register` (new):** Two-step — form → OTP input. Six input boxes with auto-advance. Resend with 60s cooldown. Store JWT on success.

**`/login` (new):** Email/password form. Handle `requiresVerification` response with resend option.

**`/register/verify` (new):** Deep-link page for mid-flow recovery via `?userId=X`.

**Navbar:** Replace "Get Started" alert with Link to `/register`. Add Login link.

### 5. Environment Config

| Variable | Purpose | Example |
|----------|---------|---------|
| `EMAIL_HOST` | SMTP hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `noreply@botify.com` |
| `EMAIL_PASS` | SMTP password | `your-app-password` |
| `EMAIL_FROM` | From header | `"Botify" <noreply@botify.com>` |
| `OTP_EXPIRY_MINUTES` | OTP validity | `5` |
| `RESEND_COOLDOWN_SECONDS` | Resend delay | `60` |

Add to `src/constants/env.ts` required check and `config/.env.example`. Install `nodemailer` + `@types/nodemailer`.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Duplicate email | 409, don't reveal if existing is verified |
| Already verified + verify-otp | 200 with token (login directly) |
| Already verified + resend-otp | 400 "already verified" |
| OTP expired | 410 "expired, request new" |
| ≥5 wrong attempts | 429 "too many attempts, request new" |
| Resend <60s | 429 with retryAfter |
| Email service failure | Log error, return success (user can resend) |
| User not found | 404 (don't reveal ID format validity) |

---

## Testing

**Unit:** `generateOtp`, `hashOtp`, AuthService methods (register, login, verifyOtp, resendOtp), EmailService.sendOtpEmail
**Integration:** Full register→verify→login flow, duplicate email, wrong OTP, expired OTP, rate limiting, unverified login rejection
**E2E:** Complete registration flow, login with verification prompt

Mock prisma module and nodemailer. Use supertest for API tests.

---

## Definition of Done
- [ ] Prisma schema updated, migration runs
- [ ] All 4 endpoints implemented and tested
- [ ] Email service sends OTPs (Ethereal for dev)
- [ ] Frontend auth pages functional
- [ ] Navbar links updated
- [ ] All edge cases handled
- [ ] Unit + integration tests passing
- [ ] No TypeScript errors
- [ ] Env vars in `.env.example`
