# Feature: User Dashboard with Bot Management

## Overview
This feature implements a comprehensive user dashboard that provides analytics overview and bot management capabilities. Users can view their dashboard with key metrics (total bots, conversations, engagement), manage their bots (CRUD operations), and edit bot details through a slide-out drawer. The dashboard includes real-time data refresh, responsive design, and follows the existing multi-package codebase patterns for authentication, error handling, and API integration.

## Scope
**In scope:**
- Dashboard component displaying user analytics and key metrics
- Sidebar navigation with "Manage Bots" tab
- Manage bots page with list, search, filter, and bulk actions
- Bot edit side drawer with form validation
- All required backend API endpoints (GET /analytics/user, GET /bots/user, GET /bots/:id, PUT /bots/:id, DELETE /bots/:id, PATCH /bots/:id/status)
- Authentication enforcement for all endpoints
- Responsive design following existing frontend patterns
- Loading states, error handling, and data caching
- Unit and integration tests for frontend and backend

**Out of scope:**
- Advanced chart libraries beyond basic metrics display
- Real-time WebSocket updates (periodic refresh is sufficient)
- Admin-level bot management (users can only manage their own bots)
- Bot deployment to production environments
- Advanced bot configuration beyond existing schema fields

## Assumptions
- Users can only access their own bots and analytics data
- Bot status values are "draft", "active", "inactive", "archived" as defined in schema
- Frontend uses Next.js 16 with TypeScript and Tailwind CSS
- Authentication is JWT-based with verifyToken and authorizeRole middleware
- API responses follow existing pattern: { success: true, data: {...} } or { success: false, error: "..." }
- All existing bot fields from Prisma schema are supported
- Mobile-responsive design is required
- Form validation follows existing frontend patterns
- Error handling uses AppError class for backend and proper error states for frontend

---

## Codebase Context

### Relevant Existing Files
| File | Relevance |
|------|-----------|
| `src/routes/bot.routes.ts` | Extend with user-specific endpoints (GET /bots/user) |
| `src/routes/analytics.routes.ts` | Add GET /analytics/user endpoint |
| `src/services/bot.service.ts` | Add getUserBots, deleteBot, toggleBotStatus methods |
| `src/services/analytics.service.ts` | Add getUserOverview method |
| `src/controllers/bot.controller.ts` | Add userBots, deleteBot, toggleStatus handlers |
| `src/controllers/analytics.controller.ts` | Add getUserOverview handler |
| `multirag-frontend/src/app/layout.tsx` | Dashboard will be a child route |
| `multirag-frontend/src/components/common/Navbar.tsx` | Add "Manage Bots" navigation item |
| `multirag-frontend/src/app/dashboard/page.tsx` | Dashboard component location |
| `multirag-frontend/src/app/dashboard/manage-bots/page.tsx` | Manage bots page location |
| `multirag-frontend/src/components/BotEditDrawer.tsx` | New edit drawer component |

### Data Models Affected

**Current Bot model (from prisma/schema.prisma):**
```prisma
model Bot {
  id               String              @id @default(uuid())
  userId           String              @map("user_id")
  name             String
  slug             String
  systemPrompt     String              @map("system_prompt")
  model            String
  temperature      Float               @map("temperature")
  maxTokens        Int                 @map("max_tokens")
  status           String              @default("draft")
  embedKey         String              @unique @map("embed_key")
  widgetConfig     Json                @default("{}") @map("widget_config")
  allowedDomains   Json                @default("[]") @map("allowed_domains")
  isPublic         Boolean             @default(false) @map("is_public")
  messageCount     Int                 @default(0) @map("message_count")
  lastActiveAt     DateTime?           @map("last_active_at")
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  deletedAt        DateTime?           @map("deleted_at")
  user             User                @relation(fields: [userId], references: [id])
}
```

**Required changes:**
- No schema changes needed - existing fields support all requirements

### Patterns to Follow
- Auth pattern: Use `verifyToken` middleware from `src/middleware/auth.middleware.ts` and `authorizeRole` with `Role.USER`
- Error handling: Throw `AppError` from `src/utils/appError.ts`, not native Error
- Response shape: Wrap all API responses in `{ success, data, error }` envelope
- Async handling: Use `asyncHandler` from `src/utils/asyncHandler.ts`
- Service pattern: Class-based singletons with arrow function methods
- Frontend state: Use React state with proper loading/error states
- Navigation: Update sidebar active state based on current route
- Form validation: Real-time validation with clear error messages
- Responsive design: Follow existing Tailwind CSS patterns

---

## Implementation Plan

### 1. Database / Schema Changes
No schema changes required - existing Bot model supports all dashboard functionality.

### 2. Backend — API Layer

**`GET /analytics/user`**
- Auth required: yes (Role.USER)
- Request: No body, query params for date range if needed
- Response: Analytics overview with metrics and trends
- Business logic: Fetch user analytics from AnalyticsService.getUserOverview
- Error cases: 401 (unauthorized), 500 (server error)

**`GET /bots/user`**
- Auth required: yes (Role.USER)
- Request: Query params for pagination, search, filters
- Response: Paginated list of user bots with metadata
- Business logic: Fetch user bots from BotService.getUserBots
- Error cases: 401 (unauthorized), 500 (server error)

**`GET /bots/:id`**
- Auth required: yes (Role.USER, bot ownership check)
- Request: Bot ID in path
- Response: Specific bot details
- Business logic: Fetch bot with ownership validation
- Error cases: 401 (unauthorized), 403 (forbidden), 404 (not found)

**`PUT /bots/:id`**
- Auth required: yes (Role.USER, bot ownership check)
- Request: Bot ID in path, bot details in body
- Response: Updated bot details
- Business logic: Update bot with validation
- Error cases: 400 (validation error), 401 (unauthorized), 403 (forbidden), 404 (not found)

**`DELETE /bots/:id`**
- Auth required: yes (Role.USER, bot ownership check)
- Request: Bot ID in path
- Response: Success message
- Business logic: Soft delete bot (set deletedAt)
- Error cases: 401 (unauthorized), 403 (forbidden), 404 (not found)

**`PATCH /bots/:id/status`**
- Auth required: yes (Role.USER, bot ownership check)
- Request: Bot ID in path, status in body
- Response: Updated bot with new status
- Business logic: Toggle bot active/inactive status
- Error cases: 400 (invalid status), 401 (unauthorized), 403 (forbidden), 404 (not found)

### 3. Backend — Service / Business Logic

**New BotService methods:**
- `getUserBots(userId: string, options: PaginationOptions): Promise<{ bots: Bot[]; total: number }>`
- `deleteBot(botId: string, userId: string): Promise<{ message: string }>`
- `toggleBotStatus(botId: string, userId: string, status: string): Promise<{ message: string; bot: Bot }>`

**New AnalyticsService method:**
- `getUserOverview(userId: string): Promise<AnalyticsOverview>`

### 4. Backend — Queue / Background Jobs (if applicable)
Not required for this feature - all operations are synchronous.

### 5. Frontend — Pages & Routes (if applicable)

**Dashboard Page (`/dashboard`):**
- New route in `multirag-frontend/src/app/dashboard/page.tsx`
- Displays analytics overview with metrics cards
- Includes charts/graphs for trends
- Real-time data refresh every 30 seconds
- Loading states and error boundaries

**Manage Bots Page (`/dashboard/manage-bots`):**
- New route in `multirag-frontend/src/app/dashboard/manage-bots/page.tsx`
- Lists all user bots with search and filter
- Supports pagination (10 items per page)
- Bulk actions: activate/deactivate, delete
- Click to open edit drawer

### 6. Frontend — State & Side Effects (if applicable)

**Dashboard State:**
- Analytics data: SWR hook for caching and auto-refresh
- Loading states: boolean flags for each data fetch
- Error states: error objects with user-friendly messages

**Manage Bots State:**
- Bot list: SWR hook with pagination support
- Search/filters: local state with debounced updates
- Selection: array of selected bot IDs for bulk actions
- Drawer: boolean visibility state with form data

### 7. Auth & Permissions
- Users can only access their own bots and analytics data
- Enforcement happens in middleware (verifyToken) and service layer (ownership checks)
- UI shows/hides elements based on authentication status
- Sidebar navigation only visible to authenticated users

### 8. Environment & Config
No new environment variables required.

---

## Edge Cases & Error Handling

| Scenario | Expected behavior |
|----------|------------------|
| User hits rate limit | Return 429 with retryAfter header |
| File upload exceeds size | Reject with 413 before processing |
| Concurrent writes to same record | Use DB-level upsert or optimistic locking |
| Invalid bot ID format | Return 400 with validation error |
| Bot not found | Return 404 with "Bot not found" message |
| User tries to access another user's bot | Return 403 with "Forbidden" message |
| Network timeout | Return 504 with retry suggestion |
| Server error | Return 500 with generic error message |

---

## Testing Requirements

### Unit Tests
- BotService.getUserBots, deleteBot, toggleBotStatus
- AnalyticsService.getUserOverview
- BotController handlers (error cases, validation)
- Mock Prisma client for database operations

### Integration Tests
- Full dashboard data fetch flow
- Bot list with pagination and search
- Bot CRUD operations with authentication
- Edit drawer form validation

### E2E Tests (if applicable)
- Complete dashboard navigation flow
- Bot management operations (create, read, update, delete)
- Edit drawer form submission
- Mobile responsive behavior

---

## Definition of Done
- [ ] All endpoints return correct responses for happy and error paths
- [ ] DB migrations run cleanly (no schema changes needed)
- [ ] Auth/permission rules enforced (users can only access own data)
- [ ] All edge cases in this doc handled
- [ ] Unit and integration tests passing
- [ ] No TypeScript errors
- [ ] Feature works in local dev environment
- [ ] Dashboard displays analytics with real-time updates
- [ ] Bot management includes all CRUD operations
- [ ] Edit drawer supports all bot fields with validation
- [ ] Responsive design works on mobile and desktop
- [ ] Loading states and error handling implemented
- [ ] Sidebar navigation updated with "Manage Bots" tab
- [ ] All tests passing (unit, integration, e2e)
