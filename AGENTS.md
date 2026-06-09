# Multi RAG-Platform

## Packages

| Package  | Path                 | Tech                                | Command                               |
| -------- | -------------------- | ----------------------------------- | ------------------------------------- |
| Backend  | `.`                  | Express v5 + TypeScript v6 + Prisma | `npm run dev` (tsx watch)             |
| Frontend | `multirag-frontend/` | Next.js 16                          | `cd multirag-frontend && npm run dev` |
| Widget   | `widget/`            | Vite + TypeScript v5 (IIFE)         | `npm run build:widget`                |

## Backend commands

Run any from repo root:

```sh
npm run dev          # tsx watch src/server.ts (hot reload)
npm run build        # builds widget + tsc
npm run build:widget # widget IIFE → src/public/widget.js
npm run start        # node dist/index.js
npm test             # placeholder — no tests exist
```

No lint, typecheck, or formatter scripts exist.

## Architecture

- **Stack**: Express v5, Prisma (pgBouncer + driver adapters), LangChain (Gemini embeddings, Groq chat)
- **Auth**: JWT (`verifyToken` + `authorizeRole` middleware applied per-route file, not in app assembly)
- **Env**: loaded from `config/.env` (not root). Validated at startup via `allEnvsExist()` in `src/server.ts`
- **Prisma**: uses `@prisma/adapter-pg` (not standard client). Schema in `prisma/schema.prisma`
- **Widget**: built as IIFE via Vite, output copied to `src/public/widget.js`. Public routes use domain-based CORS
- **Entrypoints**: `src/server.ts` (bootstrap) → `src/index.ts` (Express app). DB client: `src/lib/prisma.ts`. LLM models: `src/lib/gemini.ts`
- **Routes each self‑contain auth**: `bot.routes.ts`, `knowledge.routes.ts`, `analytics.routes.ts` use `router.use(verifyToken, authorizeRole(...))`. Chat has mixed public/protected. Widget is fully public

## Quirks

- TypeScript v6 at root, TypeScript v5 in `multirag-frontend/` and `widget/`
- Express v5 has breaking changes from v4 (e.g., router param handling, error middleware signature)
- No CI, no tests, no lint — agent must verify correctness manually
- `tsconfig.json` uses `"module": "commonjs"` but `package.json` has `"type": "module"` — works via `tsx` but matters for compiled output
