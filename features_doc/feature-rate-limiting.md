# Feature: Rate Limiting on Auth & Public Endpoints

## Overview
Add IP-based rate limiting to all unprotected public endpoints — auth routes, OTP routes, and the public chat endpoint. Uses `express-rate-limit` with in-memory store (no Redis). Four tiers with different windows/limits prevent brute-force login, OTP guessing, and chat abuse while keeping the global fallback generous for normal traffic.

## Scope
**In scope:**
- Install `express-rate-limit`
- New `src/middleware/rateLimiter.middleware.ts` with 4 tiered limiter factories
- Apply per-route rate limiters to `auth.routes.ts` (6 endpoints) and `chat.routes.ts` (1 POST endpoint)
- Global fallback limiter applied in `src/index.ts`
- `Retry-After` header on 429 responses

**Out of scope:**
- Redis-backed distributed rate limiting
- Rate limiting on protected routes (bot, knowledge, analytics)
- Widget route rate limiting
- Frontend retry/backoff logic
- Per-user rate limiting (IP-only for MVP)

## Assumptions
- In-memory store acceptable for single-instance deployment
- `express-rate-limit` v7+ compatible with Express v5
- `req.ip` works correctly (proxy config is a deployment concern, not in scope)
- Rate limits applied at route level, not global `app.use()`
- 429 body reuses existing `{ error: string }` shape

---

## Codebase Context

### Relevant Existing Files

| File | Relevance |
|------|-----------|
| `src/routes/auth.routes.ts` | Apply `authLimiter` to register/login/forgot-password/reset-password, `otpLimiter` to verify-otp/resend-otp |
| `src/routes/chat.routes.ts` | Apply `chatLimiter` to POST `/:botId` |
| `src/index.ts` | Apply `globalLimiter` before 404 handler |
| `src/middleware/errorHandler.middleware.ts` | No change — 429 returned directly by rate limiter, not via `AppError` |
| `package.json` | Add `express-rate-limit` dependency |

### Data Models Affected
None. Rate limiting is purely middleware — no DB changes.

### Patterns to Follow
- Middleware files: `src/middleware/<name>.middleware.ts`
- Route files self-apply middleware at the top (see `bot.routes.ts` pattern)
- Error responses: `{ error: 'message' }`
- No comments unless asked

---

## Implementation Plan

### 1. Install Dependency
```sh
npm install express-rate-limit
```

### 2. New File: `src/middleware/rateLimiter.middleware.ts`

```ts
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many OTP requests, please try again later' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many chat requests, please try again later' },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

export { authLimiter, otpLimiter, chatLimiter, globalLimiter };
```

**Key decisions:**
- `standardHeaders: 'draft-7'` — returns `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After` per IETF draft-7
- `legacyHeaders: false` — disables deprecated `X-RateLimit-*` headers
- `message` — matches project's `{ error: string }` shape
- Default IP key (`req.ip`) — no custom `keyGenerator`

### 3. Modify: `src/routes/auth.routes.ts`

Add import + per-route middleware. Each `router.post` call gets limiter as second argument:

```ts
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleware';

// Register, login, forgot-password, reset-password → authLimiter
// verify-otp, resend-otp → otpLimiter
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:resetToken', authLimiter, resetPassword);
```

### 4. Modify: `src/routes/chat.routes.ts`

Add import + apply to public POST only. Protected GET route unchanged:

```ts
import { chatLimiter } from '../middleware/rateLimiter.middleware';
router.post('/:botId', chatLimiter, chat);
```

### 5. Modify: `src/index.ts`

Add import + apply global fallback after all route mounts, before 404:

```ts
import { globalLimiter } from './middleware/rateLimiter.middleware';
// ... after route mounts ...
app.use(globalLimiter);
// 404 handler
app.use((req, res) => { res.status(404).json({ error: 'Route not found' }); });
```

---

## Edge Cases & Error Handling

| Scenario | Expected behavior |
|----------|------------------|
| Auth endpoint exceeds 20 req/15min | 429 `{ error: "Too many authentication attempts..." }` + `Retry-After` header |
| OTP endpoint exceeds 5 req/min | 429 `{ error: "Too many OTP requests..." }` + `Retry-After` header |
| Chat POST exceeds 20 req/min | 429 `{ error: "Too many chat requests..." }` + `Retry-After` header |
| Any public endpoint exceeds 100 req/15min | 429 `{ error: "Too many requests..." }` + `Retry-After` header |
| Rate limit hit mid-request (concurrent) | `express-rate-limit` increments before handler runs — safe |
| Server restart | In-memory counters reset (acceptable for MVP) |
| `Retry-After` header value | Seconds until window reset, calculated automatically |
| `RateLimit-Remaining` header | Integer count of remaining requests in window |

---

## Testing Requirements

### Unit Tests
- Each limiter exported and is a function
- Mock `req`/`res`/`next`, call limiter, verify `next()` for sub-limit and 429 for limit-exceeded
- Verify response body shape and headers

### Integration Tests
- **Auth:** 21 POST to `/api/auth/register` → 21st returns 429
- **OTP:** 6 POST to `/api/auth/verify-otp` → 6th returns 429
- **Chat:** 21 POST to `/api/chat/:botId` → 21st returns 429
- **Global:** 101 requests to any unprotected route → 429
- **Window reset:** Hit limit, fast-forward timer, verify success
- **Protected routes:** GET `/api/bots/user` with valid token unaffected

### Test utilities
- `supertest` for HTTP-level tests
- `jest` fake timers to fast-forward window expiry
- Fresh limiter instance per test to reset state

---

## Definition of Done

- [ ] `express-rate-limit` installed
- [ ] `src/middleware/rateLimiter.middleware.ts` created with 4 exporters
- [ ] `src/routes/auth.routes.ts` — `authLimiter` on register/login/forgot-password/reset-password, `otpLimiter` on verify-otp/resend-otp
- [ ] `src/routes/chat.routes.ts` — `chatLimiter` on POST `/:botId`
- [ ] `src/index.ts` — `globalLimiter` before 404 handler
- [ ] 429 responses return `{ error: '...' }` with `Retry-After`, `RateLimit-Remaining`, `RateLimit-Reset` headers
- [ ] No TypeScript errors
- [ ] No regressions — existing endpoints work when under limit
- [ ] Unit tests for limiter configuration
- [ ] Integration tests for each tier hitting the limit
