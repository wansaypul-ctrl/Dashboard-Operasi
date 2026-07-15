# Supabase Setup — Sistem Dashboard Pemantauan Bersepadu JTM

This folder contains the complete PostgreSQL setup for your Supabase project
(`fvgchttusdnfsjjtzhkf`), matching the PRD §5 database design.

## Project details
- **Project URL:** `https://fvgchttusdnfsjjtzhkf.supabase.co`
- **Region:** Singapore (ap-southeast-1)
- **Database:** PostgreSQL 15

## Files
| File | Purpose |
|---|---|
| `schema.sql` | 14 core `tbl_*` tables + 4 lookup tables + audit log, with `uuid` PKs, `gen_random_uuid()`, CHECK constraints, indexes, `updated_at` triggers, and **Row Level Security** enabled on every table. |
| `seed.sql` | Realistic dummy data for all 18 tables (568+ rows total) — same dataset as the local preview. Safe to re-run (truncates first). |
| `views.sql` | 13 aggregate KPI views (one per module) + `vw_executive_summary` master view. |

---

## Setup — Option A: Supabase SQL Editor (recommended, no CLI needed)

1. Open your Supabase dashboard → **SQL Editor**
   (`https://supabase.com/dashboard/project/fvgchttusdnfsjjtzhkf/sql/new`).

2. **Run `schema.sql`** — copy the entire file contents into the editor and
   click **Run**. This creates all tables, triggers, indexes, and RLS policies.

3. **Run `seed.sql`** — same way. This populates every table with dummy data.
   The final statement returns a one-row summary confirming row counts per
   module (FR-01 … FR-14).

4. **Run `views.sql`** — creates the aggregate KPI views used by the dashboard.

5. **Verify** — run this in the SQL Editor:
   ```sql
   select * from public.vw_executive_summary;
   ```
   You should see one row with all 14 headline KPIs populated.

> The connection string you shared contains `[YOUR-PASSWORD]` as a placeholder,
> so direct `psql`/Prisma push from this machine isn't possible without the
> real password. The SQL Editor approach above needs **no password** — you
> authenticate via your Supabase dashboard session.

---

## Setup — Option B: Supabase CLI (if you prefer the terminal)

```bash
# 1. Install & login (one-time)
npm install -g supabase
supabase login                 # opens browser

# 2. Link this project
supabase link --project-ref fvgchttusdnfsjjtzhkf

# 3. Push the schema (equivalent to running schema.sql)
supabase db push

# 4. Seed (run seed.sql + views.sql via the SQL Editor, OR):
psql "postgresql://postgres:YOUR_PASSWORD@db.fvgchttusdnfsjjtzhkf.supabase.co:5432/postgres" \
  -f seed.sql
psql "postgresql://postgres:YOUR_PASSWORD@db.fvgchttusdnfsjjtzhkf.supabase.co:5432/postgres" \
  -f views.sql
```

---

## Verifying from the dashboard

Once the SQL is run, this Next.js app can confirm live connectivity:

```bash
# From the running app (dev server on :3000):
curl http://localhost:3000/api/supabase-status
# → { "configured": true, "connected": true, "programsCount": 10, ... }
```

The endpoint pings `tbl_program` with the publishable (anon) key. If it
returns `connected: true` with a count, your Supabase backend is live and
the RLS `SELECT` policy is working.

---

## Security notes (PRD §5.2)

- **RLS is ENABLED on every table** — no exceptions.
- The **publishable/anon key** in `.env` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is
  *public by design* and safe to ship to the browser. It is protected by RLS,
  not by secrecy.
- Current policies (demo-friendly):
  - `SELECT` → allowed for `anon` + `authenticated` on all tables.
  - `INSERT/UPDATE/DELETE` → allowed for `authenticated` only.
- **Production hardening:** before going live, restrict write policies to
  users with a custom JWT claim `is_admin = true` (Super Admin), and scope
  `SELECT` per role via `tbl_user_roles` (PRD §2, §5.2).
- **Never** put the `service_role` key in `.env` with a `NEXT_PUBLIC_` prefix
  or in any client-rendered code — it bypasses RLS.

---

## Connecting Prisma to Supabase (optional)

To switch the local Prisma backend from SQLite → your live Supabase Postgres:

1. Uncomment `SUPABASE_DIRECT_URL` in `.env` and replace `[YOUR-PASSWORD]`
   with your real database password
   (Dashboard → Project Settings → Database → Connection string → URI).
2. Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"          // was "sqlite"
     url      = env("SUPABASE_DIRECT_URL")
   }
   ```
3. Push the schema:
   ```bash
   bun run db:push
   bun run prisma/seed.ts   # optional — seed.sql already loaded it
   ```

> ⚠️ This is optional. The dashboard preview keeps using local SQLite so it
> always runs offline; Supabase becomes the production backend on Netlify.
