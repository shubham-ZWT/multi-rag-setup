# Feature: Refresh Token Mechanism

## Overview
Add a refresh token flow so short-lived access tokens (1h) can be silently renewed without re-login. Refresh tokens (7d) are stored hashed in the database, rotated on each use, and revoked on logout or password reset. Single-device model (one refresh token per user).

## Scope
**In scope:**
- `refreshToken` + `refreshTokenExpires` fields on User model
- `POST /api/auth/refresh` (token rotation) and `POST /api/auth/logout` endpoints
- Modify `login`, `verifyOtp` to return both tokens
- Invalidate refresh tokens on password reset
- Env vars `JWT_REFRESH_SECRET` + `REFRESH_TOKEN_EXPIRY_DAYS`

**Out of scope:**
- Frontend token storage/refresh interceptor
- Redis-based token store, multi-session support
- Refresh token audit logging

## Assumptions
- Single-device: one refresh token per user (new login replaces old)
- No Redis — refresh tokens stored as SHA-256 hashes in User table
- `JWT_REFRESH_SECRET` separate from `JWT_SECRET`
- Access token 1h, refresh token 7d (configurable via `REFRESH_TOKEN_EXPIRY_DAYS`)

---

## Codebase Context

### Relevant Files
| File | Relevance |
|------|-----------|
| `prisma/schema.prisma` | Add 2 fields to User |
| `src/services/auth.service.ts` | Modify login/verifyOtp, add refresh/logout |
| `src/controllers/auth.controller.ts` | Add refresh/logout handlers, modify responses |
| `src/routes/auth.routes.ts` | Add `/refresh` and `/logout` routes |
| `src/constants/errors.ts` | Add `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_MISSING` |
| `src/constants/env.ts` | Add `JWT_REFRESH_SECRET` to required envs |

### Data Model — User additions
```prisma
refreshToken          String?  @unique @map("refresh_token")
refreshTokenExpires   DateTime? @map("refresh_token_expires")
```

### Patterns
- Errors: `AppError` from `src/utils/appError.ts`; constants in `src/constants/errors.ts`
- Controllers: wrapped in `asyncHandler`
- Services: class singleton, arrow function methods
- JWT: `jwt.sign()` / `jwt.verify()` from `jsonwebtoken`
- Env validation: `allEnvsExist()` in `src/constants/env.ts`

---

## Implementation Plan

### 1. Database / Schema
Add to User model in `prisma/schema.prisma`:
```prisma
refreshToken          String?  @unique @map("refresh_token")
refreshTokenExpires   DateTime? @map("refresh_token_expires")
```
Run: `npx prisma migrate dev --name add_refresh_token`

### 2. Constants

**`src/constants/env.ts`** — add `'JWT_REFRESH_SECRET'` to envs array.

**`src/constants/errors.ts`** — add:
```ts
export const INVALID_REFRESH_TOKEN = () =>
  new AppError('Invalid or expired refresh token', 401);
export const REFRESH_TOKEN_MISSING = () =>
  new AppError('Refresh token is required', 400);
```

### 3. API Endpoints

**`POST /api/auth/refresh`** (new, public)
- Body: `{ refreshToken: string }`
- Response (200): `{ success, token, refreshToken }`
- Logic: verify JWT signature → find user by hashed token + check expiry → generate new pair → update DB
- Errors: 400 (missing), 401 (invalid/expired)

**`POST /api/auth/logout`** (new, requires `verifyToken`)
- Response (200): `{ message }`
- Logic: set user's `refreshToken`/`refreshTokenExpires` to null

**`POST /api/auth/login`** (modified)
- Response: `{ message, token, refreshToken }` — add refreshToken to existing response

**`POST /api/auth/verify-otp`** (modified)
- Response: `{ message, token, refreshToken }` — add refreshToken

### 4. Service Layer (`src/services/auth.service.ts`)

New private helpers:
```ts
private generateRefreshToken = (userId: string) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86400000);
  const token = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
  });
  return { token, expiresAt };
};
private hashRefreshToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');
```

**`login()`** — after JWT, call `generateRefreshToken`, hash + store in DB, return `{ token, refreshToken }`.

**`verifyOtp()`** — same pattern: generate + store refresh token alongside JWT.

**`refreshAccessToken(refreshToken: string)`:** verify JWT → find user by `id + hashed token + not expired` → generate new pair → update DB → return both tokens. Throw 401 at any failure.

**`logout(userId: string)`:** update user setting `refreshToken: null, refreshTokenExpires: null`.

**`resetPassword()`** — add `refreshToken: null, refreshTokenExpires: null` to existing update data.

### 5. Controller Layer (`src/controllers/auth.controller.ts`)

```ts
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });
  const result = await AuthService.refreshAccessToken(refreshToken);
  res.status(200).json({ success: true, ...result });
});

export const logout = asyncHandler(async (req, res) => {
  const result = await AuthService.logout(req.user!.userId);
  res.status(200).json(result);
});
```

### 6. Routes (`src/routes/auth.routes.ts`)

```ts
import { verifyToken } from '../middleware/auth.middleware';
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
```

### 7. Auth & Permissions

| Endpoint | Auth | Notes |
|----------|------|-------|
| `POST /api/auth/refresh` | None | Body-only |
| `POST /api/auth/logout` | `verifyToken` | Identifies user from JWT |
| `POST /api/auth/login` | None | Response change only |
| `POST /api/auth/verify-otp` | None | Response change only |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Refresh token not provided | 400 "Refresh token is required" |
| Invalid signature | 401 |
| Valid signature, not in DB (revoked/rotated) | 401 |
| Expired refresh token | 401 |
| User deleted, token reused | 401 |
| Concurrent refresh requests | First succeeds, second fails (rotation) |
| New login replaces existing token | Old token invalid |
| Password reset | Clears refresh token |
| Access token expired, refresh valid | Client calls `/refresh` |

---

## Testing Requirements

**Unit:** `refreshAccessToken()`, `logout()`, `login()`, `resetPassword()`, `hashRefreshToken()`
**Integration:** login → access → refresh → new access → logout → refresh fails; expired/revoked token → 401; concurrent refresh → only first succeeds
**E2E:** Login returns both tokens; silent refresh before expiry

---

## Definition of Done

- [ ] Prisma schema updated, migration runs cleanly
- [ ] `POST /api/auth/refresh` with token rotation
- [ ] `POST /api/auth/logout` revokes refresh token
- [ ] `POST /api/auth/login` returns `{ token, refreshToken }`
- [ ] `POST /api/auth/verify-otp` returns `{ token, refreshToken }`
- [ ] Password reset clears refresh token
- [ ] `JWT_REFRESH_SECRET` validated at startup
- [ ] All edge cases handled
- [ ] Unit + integration tests passing
- [ ] No TypeScript errors
