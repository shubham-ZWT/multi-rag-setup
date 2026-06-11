# Prisma + Supabase: Complete Guide (Basic to Advanced)

## Table of Contents

1. [How Prisma Works](#1-how-prisma-works)
2. [Project Setup with Supabase](#2-project-setup-with-supabase)
3. [DATABASE_URL vs DIRECT_URL vs SHADOW_DATABASE_URL](#3-database_url-vs-direct_url-vs-shadow_database_url)
4. [Prisma Schema Basics](#4-prisma-schema-basics)
5. [Commands Reference](#5-commands-reference)
   - [prisma init](#prisma-init)
   - [prisma generate](#prisma-generate)
   - [prisma format](#prisma-format)
   - [prisma validate](#prisma-validate)
   - [prisma migrate dev](#prisma-migrate-dev)
   - [prisma migrate deploy](#prisma-migrate-deploy)
   - [prisma migrate reset](#prisma-migrate-reset)
   - [prisma migrate status](#prisma-migrate-status)
   - [prisma migrate resolve](#prisma-migrate-resolve)
   - [prisma migrate diff](#prisma-migrate-diff)
   - [prisma db push](#prisma-db-push)
   - [prisma db pull](#prisma-db-pull)
   - [prisma db execute](#prisma-db-execute)
   - [prisma db seed](#prisma-db-seed)
   - [prisma studio](#prisma-studio)
6. [The Shadow Database Concept](#6-the-shadow-database-concept)
7. [Understanding Drift and How to Resolve It](#7-understanding-drift-and-how-to-resolve-it)
8. [Development vs Production Workflows](#8-development-vs-production-workflows)
9. [Supabase-Specific Setup](#9-supabase-specific-setup)
10. [Migration History and Source Control](#10-migration-history-and-source-control)
11. [Common Pitfalls and Solutions](#11-common-pitfalls-and-solutions)

---

## 1. How Prisma Works

Prisma ORM has three core components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  schema.prisma  │───▶│  Prisma Client   │───▶│    Database      │
│  (Data Model)   │    │  (Query Builder) │    │  (PostgreSQL)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │
        ▼
┌──────────────────┐
│  Prisma Migrate  │
│  (Migration Tool)│
└──────────────────┘
```

**Schema-first approach:**
1. You define your data model in `schema.prisma`
2. Prisma Client is auto-generated from that schema (type-safe queries)
3. Prisma Migrate generates SQL migration files from schema changes
4. Migrations are applied to your database

**Key insight:** The Prisma schema is the **single source of truth** for your data model. The database schema should always match the end state of all applied migrations, which should match your Prisma schema.

---

## 2. Project Setup with Supabase

### Step 1: Create a Prisma user in Supabase

In Supabase SQL Editor:

```sql
-- Create custom user
create user "prisma" with password 'YOUR_SECURE_PASSWORD' bypassrls createdb;

-- Grant privileges
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

### Step 2: Initialize Prisma

```bash
npm init -y
npm install prisma tsx @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg dotenv pg

npx prisma init
```

### Step 3: Configure environment variables

```bash
# .env

# Transaction mode (port 6543) - for runtime queries
DATABASE_URL="postgresql://prisma.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode (port 5432) - for migrations
DIRECT_URL="postgresql://prisma.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### Step 4: Configure prisma.config.ts

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

### Step 5: Configure schema.prisma

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}
```

### Step 6: Create your first migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 3. DATABASE_URL vs DIRECT_URL vs SHADOW_DATABASE_URL

### DATABASE_URL (Runtime URL)

```bash
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
```

- **Used for:** Application runtime queries (Prisma Client)
- **Port:** 6543 (Supavisor transaction mode / pgBouncer)
- **Why:** Transaction mode is optimized for serverless/edge functions - it uses connection pooling
- **Key feature:** `pgbouncer=true` enables connection pooling mode
- **When to use:** Always in your application code

### DIRECT_URL (Migration URL)

```bash
DIRECT_URL="postgresql://...:5432/postgres"
```

- **Used for:** Prisma Migrate commands (`migrate dev`, `migrate deploy`)
- **Port:** 5432 (direct connection / session mode)
- **Why:** Migrations need direct database access (CREATE TABLE, ALTER TABLE, etc.)
- **Key feature:** No connection pooling - direct connection to PostgreSQL
- **When to use:** Schema migrations, database setup, `db pull`
- **Note:** Prisma Migrate uses `directUrl` automatically when configured

### SHADOW_DATABASE_URL (Development only)

```bash
SHADOW_DATABASE_URL="postgresql://...:5432/shadow_db"
```

- **Used for:** `prisma migrate dev` only (not `migrate deploy`)
- **Purpose:** Temporary database to detect schema drift
- **Key feature:** Created and deleted automatically (or reset if manually configured)
- **When to use:** Only in development, only when `prisma migrate dev` cannot create/drop databases
- **Note:** Required for cloud databases that don't allow CREATE DATABASE

### Summary Table

| URL | Port | Used By | Purpose |
|-----|------|---------|---------|
| `DATABASE_URL` | 6543 | Prisma Client | Runtime queries with pooling |
| `DIRECT_URL` | 5432 | Prisma Migrate | Direct access for migrations |
| `SHADOW_DATABASE_URL` | varies | `migrate dev` | Drift detection (dev only) |

---

## 4. Prisma Schema Basics

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  posts         Post[]
  
  @@map("users")  // Maps to "users" table in DB
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String   @map("author_id")
  author    User     @relation(fields: [authorId], references: [id])
  
  @@index([authorId])  // Creates index on author_id
  @@map("posts")
}
```

### Key Prisma Schema Concepts

| Feature | Syntax | Example |
|---------|--------|---------|
| Primary key | `@id` | `id String @id @default(uuid())` |
| Auto-increment | `@default(autoincrement())` | `id Int @id @default(autoincrement())` |
| Unique | `@unique` | `email String @unique` |
| Default value | `@default(value)` | `createdAt DateTime @default(now())` |
| Map column name | `@map("column")` | `createdAt DateTime @map("created_at")` |
| Map table name | `@@map("table")` | `@@map("users")` |
| Create index | `@@index([field])` | `@@index([authorId])` |
| Composite unique | `@@unique([f1, f2])` | `@@unique([slug, userId])` |
| Relations | `@relation(...)` | `author User @relation(fields: [authorId], references: [id])` |

---

## 5. Commands Reference

### prisma init

**Purpose:** Initialize a new Prisma project

```bash
npx prisma init
```

**Creates:**
- `prisma/schema.prisma` - Empty schema file
- `prisma.config.ts` - Configuration file
- `.env` - Environment variable template

**Options:**
| Option | Description |
|--------|-------------|
| `--datasource-provider` | Set database type (postgresql, mysql, sqlite, etc.) |
| `--url` | Specify initial DATABASE_URL |
| `--schema` | Custom path for schema file |

---

### prisma generate

**Purpose:** Generate Prisma Client from schema

```bash
npx prisma generate
```

**What it does:**
1. Reads `schema.prisma`
2. Generates type-safe client code
3. Outputs to `node_modules/@prisma/client` (or custom output path)

**When to run:**
- After any schema change
- After `npm install` (if postinstall hook is configured)
- After `prisma migrate dev` (in older versions)

**Options:**
| Option | Description |
|--------|-------------|
| `--watch` | Watch schema for changes and auto-regenerate |
| `--no-engine` | Generate without engine (for Accelerate) |

---

### prisma format

**Purpose:** Format the Prisma schema file

```bash
npx prisma format
```

**What it does:**
- Validates schema syntax
- Formats indentation and spacing
- Sorts attributes and blocks
- Persists changes to `schema.prisma`

**Example:**
```bash
# Format and check
npx prisma format --check
```

---

### prisma validate

**Purpose:** Validate schema without modifying it

```bash
npx prisma validate
```

**What it does:**
- Checks syntax
- Validates all references
- Reports errors without changing the file

---

### prisma migrate dev

**Purpose:** Create and apply migrations in development

```bash
npx prisma migrate dev
npx prisma migrate dev --name add_users_table
npx prisma migrate dev --create-only
```

**What it does:**
1. Creates a fresh shadow database (or resets existing one)
2. Replays all existing migrations in shadow database
3. Detects schema drift (manual changes to DB)
4. Compares shadow DB end-state to your Prisma schema
5. Generates new SQL migration for any differences
6. Applies all unapplied migrations to development database
7. Updates `_prisma_migrations` table

**Options:**
| Option | Description |
|--------|-------------|
| `--name` / `-n` | Name the migration |
| `--create-only` | Create migration file without applying |

**Important notes:**
- Development only - never use in production
- Requires shadow database (creates/drops automatically)
- Will prompt to reset if drift is detected
- In non-interactive environments (CI), use `--create-only` or handle drift manually

---

### prisma migrate deploy

**Purpose:** Apply pending migrations in production

```bash
npx prisma migrate deploy
```

**What it does:**
1. Reads migration history from `prisma/migrations/`
2. Checks `_prisma_migrations` table for applied migrations
3. Applies only unapplied migrations
4. Does NOT detect drift
5. Does NOT create/drop shadow database
6. Does NOT generate Prisma Client

**What it does NOT do:**
- Does not warn about missing migrations
- Does not detect if DB schema differs from migration history
- Does not reset database
- Does not generate artifacts

**Use in:** CI/CD pipelines, production deployments

---

### prisma migrate reset

**Purpose:** Reset development database and reapply all migrations

```bash
npx prisma migrate reset
```

**What it does:**
1. Drops the database/schema
2. Creates a new database/schema
3. Applies ALL migrations from scratch
4. Runs seed scripts (if configured)

**Warning:** This destroys ALL data. Development only.

---

### prisma migrate status

**Purpose:** Check migration status

```bash
npx prisma migrate status
```

**Output examples:**
```
# All good
Database schema is up to date!

# Pending migrations
Following migration have not yet been applied:
20260611000000_add_refresh_token

# Drift detected
Database schema is not in sync with your migrations.
```

---

### prisma migrate resolve

**Purpose:** Mark a migration as applied or rolled back

```bash
# Mark as applied (without running it)
npx prisma migrate resolve --applied 20260611000000_add_refresh_token

# Mark as rolled back
npx prisma migrate resolve --rolled-back 20260611000000_add_refresh_token
```

**Use cases:**
- Manually applied SQL and need to tell Prisma it's done
- Migration failed partway and needs to be marked

---

### prisma migrate diff

**Purpose:** Compare two database states and generate SQL

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema prisma/schema.prisma \
  --script
```

**Comparison options:**

| From | To | Command |
|------|-----|---------|
| Empty DB | Schema | `--from-empty --to-schema schema.prisma` |
| Schema | Database | `--from-schema schema.prisma --to-url postgres://...` |
| Database | Schema | `--from-url postgres://... --to-schema schema.prisma` |
| Migration dir | Schema | `--from-migrations prisma/migrations --to-schema schema.prisma` |
| Schema | Migration dir | `--from-schema schema.prisma --to-migrations prisma/migrations` |

**Options:**
| Option | Description |
|--------|-------------|
| `--script` | Output as SQL script |
| `--exit-code` | Exit with code 1 if differences exist |
| `--from-empty` | Treat source as empty database |
| `--to-empty` | Treat target as empty database |

**Examples:**

```bash
# Generate SQL to create all tables from schema
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script

# Compare current DB to schema (detect drift)
npx prisma migrate diff --from-url $DATABASE_URL --to-schema prisma/schema.prisma --script

# Generate down migration
npx prisma migrate diff \
  --from-schema prisma/schema.prisma \
  --to-url $DATABASE_URL \
  --script
```

---

### prisma db push

**Purpose:** Push schema directly to database (no migration files)

```bash
npx prisma db push
npx prisma db push --accept-data-loss
npx prisma db push --force-reset
```

**What it does:**
1. Introspects current database state
2. Compares to Prisma schema
3. Executes SQL to match schema
4. Does NOT create migration files
5. Does NOT update `_prisma_migrations`

**When to use:**
- Quick prototyping
- Local development without version control needs
- Testing schema changes rapidly

**When NOT to use:**
- Production
- When you need migration history
- When deploying to other environments

**Options:**
| Option | Description |
|--------|-------------|
| `--accept-data-loss` | Allow data loss during schema changes |
| `--force-reset` | Reset database before pushing |

---

### prisma db pull

**Purpose:** Introspect database and update schema

```bash
npx prisma db pull
npx prisma db pull --print  # Output to terminal only
npx prisma db pull --force  # Overwrite manual changes
```

**What it does:**
1. Connects to database
2. Reads all tables, columns, indexes, constraints
3. Generates Prisma models in `schema.prisma`
4. Overwrites existing schema (back up first!)

**Use cases:**
- Starting Prisma with existing database
- Syncing schema after manual DB changes
- Reverse engineering database structure

**Warning:** This overwrites your `schema.prisma`. Commit to git first.

---

### prisma db execute

**Purpose:** Execute raw SQL against database

```bash
# From file
npx prisma db execute --file ./script.sql

# From stdin
echo "TRUNCATE TABLE users;" | npx prisma db execute --stdin
```

**What it does:**
- Executes SQL directly
- Does NOT interact with migration history
- Does NOT update `_prisma_migrations`
- Uses DATABASE_URL from config

**Use cases:**
- Data migrations
- Manual schema fixes
- One-time SQL scripts

---

### prisma db seed

**Purpose:** Seed database with initial data

```bash
npx prisma db seed
```

**Setup in `package.json`:**
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

**Seed file (`prisma/seed.ts`):**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: { email: 'admin@example.com', name: 'Admin' },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

---

### prisma studio

**Purpose:** Open visual database browser

```bash
npx prisma studio
```

Opens a web UI to view, create, update, and delete records.

---

## 6. The Shadow Database Concept

### What is the Shadow Database?

The shadow database is a **temporary database** used only by `prisma migrate dev` to:

1. **Detect schema drift** - Has the database been modified outside of Prisma?
2. **Generate safe migrations** - Will the migration cause data loss?
3. **Validate migration history** - Do all migrations replay correctly?

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    prisma migrate dev                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Create fresh shadow DB (or reset existing)               │
│           │                                                  │
│           ▼                                                  │
│  2. Replay ALL existing migrations in shadow DB              │
│           │                                                  │
│           ▼                                                  │
│  3. Introspect shadow DB → "expected state"                  │
│           │                                                  │
│           ▼                                                  │
│  4. Introspect dev DB → "actual state"                       │
│           │                                                  │
│           ▼                                                  │
│  5. Compare "expected" vs "actual"                           │
│           │                                                  │
│           ├── Match → Generate new migration (if schema changed)
│           │                                                  │
│           └── Mismatch → DRIFT DETECTED → Prompt to reset    │
│                                                              │
│  6. Drop shadow DB                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Shadow Database Requirements

| Database | Requirement |
|----------|-------------|
| PostgreSQL | User must be superuser OR have `CREATEDB` privilege |
| MySQL | User must have `CREATE, ALTER, DROP, REFERENCES ON *.*` |
| SQLite | No special requirements |
| Cloud DBs | Must create shadow DB manually (see below) |

### Cloud Database Setup (Supabase, Heroku, etc.)

Since you can't CREATE DATABASE on cloud providers:

1. Create a separate database in Supabase dashboard
2. Set `SHADOW_DATABASE_URL` in `.env`:

```bash
SHADOW_DATABASE_URL="postgresql://prisma:password@host:5432/shadow_db"
```

3. Configure in `prisma.config.ts`:

```typescript
export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
```

### Shadow DB is NOT Required For

- `prisma migrate deploy` (production)
- `prisma migrate resolve`
- `prisma db push`
- `prisma db pull`
- `prisma db execute`
- Runtime queries (Prisma Client)

---

## 7. Understanding Drift and How to Resolve It

### What is Drift?

Drift occurs when the database schema differs from what Prisma expects based on migration history.

**Types of drift:**

| Type | Cause | Example |
|------|-------|---------|
| **Manual DB change** | Direct SQL on database | `ALTER TABLE users ADD COLUMN foo TEXT;` |
| **Missing migration** | Migration file deleted from filesystem | Deleted `20260611_add_foo/` folder |
| **Edited migration** | Modified applied migration file | Changed `VARCHAR(550)` to `VARCHAR(560)` |
| **db push remnants** | Used `db push` without creating migration | Schema matches but no migration record |

### Detecting Drift

```bash
# Method 1: migrate status
npx prisma migrate status

# Method 2: migrate diff
npx prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema prisma/schema.prisma \
  --script

# Method 3: migrate dev (will prompt if drift detected)
npx prisma migrate dev
```

### Resolving Drift

#### Scenario 1: Manual columns added to database

**Problem:** You ran raw SQL to add columns, but no migration exists.

**Solution:**
```bash
# 1. Create migration directory
mkdir -p prisma/migrations/20260611000000_add_manual_columns

# 2. Create migration.sql with the ALTER TABLE statements
cat > prisma/migrations/20260611000000_add_manual_columns/migration.sql << 'EOF'
-- AlterTable
ALTER TABLE "users" ADD COLUMN "refresh_token" TEXT;
ALTER TABLE "users" ADD COLUMN "refresh_token_expires" TIMESTAMP(3);
EOF

# 3. Mark as applied
npx prisma migrate resolve --applied 20260611000000_add_manual_columns
```

#### Scenario 2: Columns exist but migration not tracked

**Problem:** `prisma migrate deploy` says "No pending migrations" but columns exist.

**Solution:**
```bash
# 1. Create migration file with the SQL
mkdir -p prisma/migrations/20260611000000_add_refresh_token
echo 'ALTER TABLE "users" ADD COLUMN "refresh_token" TEXT;' > prisma/migrations/20260611000000_add_refresh_token/migration.sql

# 2. Insert record into _prisma_migrations table
npx prisma db execute --stdin << 'EOF'
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, rolled_back_at, started_at) 
VALUES (gen_random_uuid()::text, 'manual', NOW(), '20260611000000_add_refresh_token', NULL, NOW());
EOF
```

#### Scenario 3: Using --diff to generate missing migration

**Problem:** You need to create a migration for changes that were already applied.

**Solution:**
```bash
# Generate SQL comparing empty DB to current schema
npx prisma migrate diff \
  --from-empty \
  --to-schema prisma/schema.prisma \
  --script > prisma/migrations/20260611000000_init/migration.sql

# Or compare a specific table
npx prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema prisma/schema.prisma \
  --script
```

#### Scenario 4: Reset after drift (development only)

**Warning:** This destroys all data.

```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Preventing Drift

1. **Always use Prisma Migrate** - Never manually ALTER TABLE in production
2. **Commit migration files** - Never delete applied migrations
3. **Use `--create-only`** - In non-interactive environments
4. **Review migrations** - Before applying, check the generated SQL
5. **Use `db execute` carefully** - It bypasses migration tracking

---

## 8. Development vs Production Workflows

### Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Edit schema.prisma                                  │
│           │                                              │
│           ▼                                              │
│  2. Run `prisma migrate dev --name description`         │
│           │                                              │
│           ├── Shadow DB created                          │
│           ├── Drift detected? → Prompt reset             │
│           ├── New migration generated                    │
│           ├── Migration applied to dev DB                │
│           └── Shadow DB dropped                          │
│           │                                              │
│           ▼                                              │
│  3. Review generated SQL in migration file               │
│           │                                              │
│           ▼                                              │
│  4. Commit migration files to git                        │
│           │                                              │
│           ▼                                              │
│  5. (Optional) Customize migration SQL                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key commands:**
```bash
npx prisma migrate dev --name add_users          # Create + apply
npx prisma migrate dev --create-only             # Create only
npx prisma migrate dev --name fix_typo --create-only  # Then edit SQL
npx prisma migrate reset                         # Reset dev DB
npx prisma migrate status                        # Check status
```

### Production Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Migration files already in git (from development)    │
│           │                                              │
│           ▼                                              │
│  2. Deploy code to production server                     │
│           │                                              │
│           ▼                                              │
│  3. Run `prisma migrate deploy` in CI/CD pipeline       │
│           │                                              │
│           ├── Reads migration files                      │
│           ├── Checks _prisma_migrations table            │
│           ├── Applies only unapplied migrations          │
│           └── No shadow DB needed                        │
│           │                                              │
│           ▼                                              │
│  4. Run `prisma generate` (or auto in build)            │
│           │                                              │
│           ▼                                              │
│  5. Start application                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key commands:**
```bash
npx prisma migrate deploy              # Apply pending migrations
npx prisma generate                    # Generate client
npx prisma migrate status              # Verify status
```

### CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
steps:
  - name: Install dependencies
    run: npm ci
    
  - name: Apply migrations
    run: npx prisma migrate deploy
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
  - name: Generate Prisma Client
    run: npx prisma generate
    
  - name: Build application
    run: npm run build
    
  - name: Deploy
    run: ./deploy.sh
```

### Non-Interactive Environments (CI, Docker)

`prisma migrate dev` requires interactive input. Alternatives:

```bash
# Option 1: Use --create-only
npx prisma migrate dev --name migration_name --create-only

# Option 2: Use migrate deploy (if migrations already exist)
npx prisma migrate deploy

# Option 3: Use db push (prototyping only)
npx prisma db push

# Option 4: Use db execute for manual SQL
npx prisma db execute --file ./migration.sql
```

---

## 9. Supabase-Specific Setup

### Connection Modes

Supabase offers two connection modes via Supavisor:

| Mode | Port | Use Case |
|------|------|----------|
| **Session** | 5432 | Migrations, direct connections |
| **Transaction** | 6543 | Application runtime (with pgBouncer) |

### Supabase + Prisma Configuration

```prisma
// schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}
```

```bash
# .env
DATABASE_URL="postgresql://prisma.project_ref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://prisma.project_ref:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Supabase-Specific Considerations

1. **Row Level Security (RLS):** If using RLS, ensure Prisma user has bypass privileges
2. **Schema:** Prisma defaults to `public` schema
3. **Extensions:** Enable in Supabase dashboard, not via Prisma
4. **Functions:** Use `@db.Raw()` or `db.execute()` for Supabase RPC

### Using @prisma/adapter-pg

For Supabase with driver adapters:

```typescript
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

const prisma = new PrismaClient({ adapter });
```

---

## 10. Migration History and Source Control

### What to Commit

```
prisma/
├── migrations/
│   ├── migration_lock.toml        # ✅ Commit (provider lock)
│   ├── 20260603_init/
│   │   └── migration.sql          # ✅ Commit (migration SQL)
│   ├── 20260604_add_posts/
│   │   └── migration.sql          # ✅ Commit
│   └── 20260611_add_refresh_token/
│       └── migration.sql          # ✅ Commit
├── schema.prisma                  # ✅ Commit
└── prisma.config.ts               # ✅ Commit
```

### What NOT to Commit

```
.env                              # ❌ Never commit secrets
generated/                        # ❌ Auto-generated
node_modules/                     # ❌ Dependencies
```

### Migration History Structure

```
prisma/migrations/
├── migration_lock.toml           # Tracks provider (postgresql)
├── 20260603100614_init/
│   └── migration.sql             # SQL for this migration
├── 20260604044057_add_posts/
│   └── migration.sql
└── 20260611000000_add_users/
    └── migration.sql
```

### _prisma_migrations Table

```sql
CREATE TABLE _prisma_migrations (
    id                TEXT PRIMARY KEY,
    checksum          TEXT NOT NULL,
    finished_at       TIMESTAMP(3),
    migration_name    TEXT NOT NULL,
    rolled_back_at    TIMESTAMP(3),
    started_at        TIMESTAMP(3) NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `checksum`: SHA-256 hash of migration.sql (detects edits)
- `finished_at`: When migration completed
- `migration_name`: Folder name (e.g., `20260611000000_add_users`)
- `rolled_back_at`: If migration was rolled back

### Never Edit Applied Migrations

```bash
# ❌ WRONG: Editing a migration that's already been applied
# Edit 20260603_init/migration.sql after running it

# ✅ CORRECT: Create a new migration
npx prisma migrate dev --name fix_column_type
```

If you must fix a mistake:
```bash
# Create a new migration that corrects the issue
npx prisma migrate dev --name fix_previous_migration
```

---

## 11. Common Pitfalls and Solutions

### Pitfall 1: "migrate dev" fails in non-interactive environments

**Error:** `Prisma Migrate has detected that the environment is non-interactive`

**Solution:**
```bash
# Use --create-only to generate migration without applying
npx prisma migrate dev --name my_migration --create-only

# Then manually apply in production
npx prisma migrate deploy
```

### Pitfall 2: "No pending migrations" but schema changed

**Error:** `prisma migrate deploy` says no pending migrations after schema change

**Cause:** Migration files not created yet

**Solution:**
```bash
# Create the migration
npx prisma migrate dev --name add_column --create-only

# Then deploy
npx prisma migrate deploy
```

### Pitfall 3: Drift detected but can't reset production

**Error:** Schema drift detected in production

**Solution:**
```bash
# 1. Create migration for the drift
npx prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema prisma/schema.prisma \
  --script > fix_drift.sql

# 2. Review the SQL
cat fix_drift.sql

# 3. Apply via db execute (bypasses migration tracking)
npx prisma db execute --file fix_drift.sql

# 4. Create proper migration file
mkdir -p prisma/migrations/20260611_fix_drift
cp fix_drift.sql prisma/migrations/20260611_fix_drift/migration.sql

# 5. Mark as applied
npx prisma migrate resolve --applied 20260611_fix_drift
```

### Pitfall 4: Shadow database permission denied

**Error:** `ERROR: permission denied to create database`

**Solution:**
```sql
-- Grant CREATEDB to Prisma user
ALTER USER prisma CREATEDB;
```

Or configure shadow database URL:
```bash
SHADOW_DATABASE_URL="postgresql://prisma:password@host:5432/shadow_db"
```

### Pitfall 5: TypeScript errors after schema change

**Error:** Types not matching after adding fields

**Solution:**
```bash
npx prisma generate
# Restart TypeScript server (VS Code: Ctrl+Shift+P → TypeScript: Restart TS Server)
```

### Pitfall 6: `db push` and `migrate dev` conflict

**Error:** Drift detected after using `db push` with existing migration history

**Solution:**
```bash
# Reset and start fresh (development only)
npx prisma migrate reset
npx prisma migrate dev
```

### Pitfall 7: Migration file accidentally deleted

**Error:** `Migration 20260603_init was modified after it was applied`

**Solution:**
```bash
# Restore from git
git checkout HEAD -- prisma/migrations/20260603_init/

# Or if truly lost, create new migration and resolve
npx prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema prisma/schema.prisma \
  --script > prisma/migrations/20260611_fix/migration.sql

npx prisma migrate resolve --applied 20260611_fix
```

### Pitfall 8: Supabase connection timeout

**Error:** Connection timeout when connecting to Supabase

**Solution:**
```bash
# Use session mode for migrations
DIRECT_URL="postgresql://...:5432/postgres"

# Use transaction mode for runtime
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
```

---

## Quick Reference Card

```bash
# Setup
npx prisma init                                    # New project
npx prisma generate                                # Generate client

# Development
npx prisma migrate dev --name description          # Create + apply migration
npx prisma migrate dev --create-only               # Create migration only
npx prisma migrate reset                           # Reset dev database
npx prisma migrate status                          # Check status
npx prisma format                                  # Format schema
npx prisma validate                                # Validate schema

# Production
npx prisma migrate deploy                          # Apply pending migrations
npx prisma migrate resolve --applied migration_name  # Mark as applied

# Introspection
npx prisma db pull                                 # DB → Schema
npx prisma db push                                  # Schema → DB (no migration)
npx prisma db execute --file script.sql            # Run raw SQL

# Utilities
npx prisma studio                                  # Visual DB browser
npx prisma db seed                                  # Seed database
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script  # Generate SQL
```

---

## References

- [Prisma Migrate Docs](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma CLI Reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
- [Shadow Database](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database)
- [Supabase + Prisma Quickstart](https://supabase.com/docs/guides/database/prisma)
- [Migration Histories](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories)
- [Prototyping with db push](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema)
