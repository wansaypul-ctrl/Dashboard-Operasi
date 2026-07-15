# Sistem Dashboard Pemantauan Bersepadu — JTM

> **Jabatan Tenaga Manusia (JTM) · Kementerian Sumber Manusia Malaysia**
> _Integrated Monitoring Dashboard System — ILP / IKM Operations_

A comprehensive glassmorphism monitoring dashboard with 14 functional modules
(FR-01 → FR-14), AI Insight generation via z.ai GLM 5.2, and a Supabase
(PostgreSQL) backend. Built per the project PRD.

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · TypeScript 5 |
| UI/UX | Tailwind CSS 4 · shadcn/ui · Glassmorphism design system |
| Charts | Recharts |
| Database | Supabase (PostgreSQL 15) · Prisma ORM (SQLite for local preview) |
| AI Engine | z.ai GLM 5.2 via `z-ai-web-dev-sdk` (server-side only) |
| Hosting | Netlify (CI/CD from this repo) |

---

## Quick start (local)

```bash
# 1. Install deps
bun install

# 2. Configure env
cp .env.example .env
#   → edit NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Push Prisma schema to local SQLite (dashboard preview DB)
bun run db:push
bun run prisma/seed.ts      # load dummy data into local SQLite

# 4. Run the dev server
bun run dev                 # → http://localhost:3000
```

---

## Supabase backend setup

The `supabase/` folder contains the full PostgreSQL schema, seed data, and
aggregate views. Run them in your Supabase SQL Editor (no password needed):

1. Open `https://supabase.com/dashboard/project/<your-project>/sql/new`
2. Run in order:
   - `supabase/schema.sql` — 18 tables + RLS + triggers + indexes
   - `supabase/seed.sql` — 568+ rows of dummy data
   - `supabase/views.sql` — 13 KPI views + executive summary
3. Verify: `select * from public.vw_executive_summary;`

See [`supabase/README.md`](./supabase/README.md) for full details.

---

## Deploy to Netlify

This repo is wired for Netlify CI/CD via [`netlify.toml`](./netlify.toml).

### One-time setup
1. Push this repo to GitHub (already done — you're reading this there).
2. Go to `https://app.netlify.com/start`
3. **"Import from Git"** → select this repo.
4. Build settings auto-detected from `netlify.toml`:
   - Build command: `bun run build`
   - Publish directory: `.next`
5. Add environment variables (Site settings → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://fvgchttusdnfsjjtzhkf.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase publishable key
   - `DATABASE_URL` = `file:/tmp/dev.db` (or your Supabase direct URL)
6. **Deploy site**. Netlify builds on every push to `main`.

### Deploy previews
Every Pull Request automatically gets a preview URL for QA/UAT (PRD §8.2).

---

## Project structure

```
├── src/
│   ├── app/
│   │   ├── api/                    # API routes (server-side)
│   │   │   ├── dashboard/          # GET /api/dashboard — 14-module KPI summary
│   │   │   ├── modules/[moduleId]/ # GET /api/modules/FR-XX — per-module data
│   │   │   ├── ai-insight/         # POST — z.ai GLM 5.2 narrative generator
│   │   │   └── supabase-status/    # GET — Supabase connectivity check
│   │   ├── globals.css             # Glassmorphism design system
│   │   ├── layout.tsx              # Poppins + Inter fonts, JTM metadata
│   │   └── page.tsx                # Single-page dashboard shell
│   ├── components/
│   │   ├── dashboard/              # Sidebar, header, KPI cards, charts, tables
│   │   └── ui/                     # shadcn/ui component set
│   └── lib/
│       ├── db.ts                   # Prisma client (local SQLite)
│       ├── supabase.ts             # Supabase client (anon key)
│       └── modules.ts              # 14-module metadata config
├── prisma/
│   ├── schema.prisma               # Prisma schema (mirrors Supabase tbl_*)
│   └── seed.ts                     # Local SQLite seed script
├── supabase/
│   ├── schema.sql                  # 18 PostgreSQL tables + RLS
│   ├── seed.sql                    # Dummy data (568+ rows)
│   ├── views.sql                   # 13 KPI aggregate views
│   └── README.md
├── download/
│   └── PRD_Sistem_Dashboard_Pemantauan_Bersepadu_JTM.pdf  # PRD document
├── netlify.toml                    # Netlify CI/CD config
└── package.json
```

## 14 functional modules (PRD §4)

| Code | Module |
|---|---|
| FR-01 | Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa |
| FR-02 | Pemantauan Aduan Pelanggan |
| FR-03 | Pentauliahan Program Sepenuh Masa |
| FR-04 | Sijil Kemahiran Malaysia (SKM) Pengajar DV |
| FR-05 | Pemantauan Kursus Tahunan Kakitangan (40 Jam) |
| FR-06 | Bajet Mengurus (OS28000 & OS26000) |
| FR-07 | Bajet Pembangunan (Penyelenggaraan/Naik Taraf) |
| FR-08 | Pemantauan Verifikasi Stok |
| FR-09 | Enrolmen Peserta Kursus Jangka Pendek |
| FR-10 | Senarai Pelajar Sepenuh Masa Bergraduat |
| FR-11 | Pemantauan Akaun Amanah |
| FR-12 | Pemantauan Akaun Mengurus |
| FR-13 | Pemantauan Aset (Semakan Aset) |
| FR-14 | Pemantauan Bilangan Komputer |

---

_Klasifikasi: Terhad — Kegunaan Dalaman_
