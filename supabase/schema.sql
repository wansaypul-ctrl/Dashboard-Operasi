-- ============================================================
-- SISTEM DASHBOARD PEMANTAUAN BERSEPADU JTM
-- Supabase (PostgreSQL 15) Schema — 14 core tables + lookups
-- PRD §5 — Reka Bentuk Pangkalan Data (Supabase)
-- Region: Singapore (ap-southeast-1)
-- ============================================================
-- Run order:  schema.sql  →  seed.sql  →  views.sql
-- ============================================================

-- Required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================
-- updated_at trigger function (reused by all tables)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- LOOKUP / REFERENCE TABLES
-- ============================================================

-- tbl_program
create table if not exists public.tbl_program (
  id              uuid primary key default gen_random_uuid(),
  program_code    text not null unique,
  program_name    text not null,
  field           text,
  level           text check (level in ('SKM3','DKM','DLKM')),
  duration_mnth   int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
drop trigger if exists trg_program_updated on public.tbl_program;
create trigger trg_program_updated before update on public.tbl_program
  for each row execute function public.set_updated_at();

-- tbl_session
create table if not exists public.tbl_session (
  id            uuid primary key default gen_random_uuid(),
  session_name  text not null unique,
  start_date    date,
  end_date      date,
  created_at    timestamptz not null default now()
);

-- tbl_staff
create table if not exists public.tbl_staff (
  id          uuid primary key default gen_random_uuid(),
  staff_no    text not null unique,
  full_name   text not null,
  department  text,
  position    text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_staff_updated on public.tbl_staff;
create trigger trg_staff_updated before update on public.tbl_staff
  for each row execute function public.set_updated_at();

-- tbl_training_center
create table if not exists public.tbl_training_center (
  id           uuid primary key default gen_random_uuid(),
  center_code  text not null unique,
  center_name  text not null,
  state        text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- FR-01 — Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa
-- ============================================================
create table if not exists public.tbl_enrolment_fulltime (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references public.tbl_session(id) on delete set null,
  session_name    text not null,
  program_id      uuid references public.tbl_program(id) on delete set null,
  target_intake   int not null default 0,
  actual_enrolled int not null default 0,
  center_name     text,
  gender_male     int default 0,
  gender_female   int default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_enrolment_session on public.tbl_enrolment_fulltime(session_name);
create index if not exists idx_enrolment_program on public.tbl_enrolment_fulltime(program_id);

-- ============================================================
-- FR-02 — Pemantauan Aduan Pelanggan
-- ============================================================
create table if not exists public.tbl_customer_complaints (
  id                  uuid primary key default gen_random_uuid(),
  complaint_ref       text not null unique,
  date_received       date not null,
  category            text not null check (category in ('Akademik','Kemudahan','Kewangan','ICT')),
  status              text not null default 'Baharu' check (status in ('Baharu','Dalam Tindakan','Selesai')),
  date_resolved       date,
  response_time_hours numeric,
  sla_target_hours    numeric not null default 72,
  complainant_type    text check (complainant_type in ('Pelajar','Ibu Bapa','Majikan','Awam')),
  description         text,
  created_at          timestamptz not null default now()
);
create index if not exists idx_complaints_status on public.tbl_customer_complaints(status);
create index if not exists idx_complaints_date on public.tbl_customer_complaints(date_received);

-- ============================================================
-- FR-03 — Pentauliahan Program Sepenuh Masa
-- ============================================================
create table if not exists public.tbl_program_accreditation (
  id                 uuid primary key default gen_random_uuid(),
  program_id         uuid references public.tbl_program(id) on delete set null,
  program_name       text not null,
  accreditation_body text check (accreditation_body in ('JPK','MQA','DSD')),
  cert_no            text,
  start_date         date,
  expiry_date        date,
  status             text not null default 'Aktif' check (status in ('Aktif','Akan Luput','Luput')),
  created_at         timestamptz not null default now()
);
create index if not exists idx_accreditation_status on public.tbl_program_accreditation(status);
create index if not exists idx_accreditation_expiry on public.tbl_program_accreditation(expiry_date);

-- ============================================================
-- FR-04 — Sijil Kemahiran Malaysia (SKM) Pengajar DV
-- ============================================================
create table if not exists public.tbl_instructor_certification (
  id            uuid primary key default gen_random_uuid(),
  instructor_id text,
  full_name     text not null,
  department    text,
  cert_level    text check (cert_level in ('SKM3','DKM','DLKM')),
  cert_no       text,
  issue_date    date,
  expiry_date   date,
  created_at    timestamptz not null default now()
);
create index if not exists idx_instructor_level on public.tbl_instructor_certification(cert_level);

-- ============================================================
-- FR-05 — Pemantauan Kursus Tahunan Kakitangan (40 Jam)
-- ============================================================
create table if not exists public.tbl_staff_training (
  id               uuid primary key default gen_random_uuid(),
  staff_id         uuid references public.tbl_staff(id) on delete set null,
  full_name        text not null,
  department       text,
  year             int not null,
  hours_completed  numeric not null default 0,
  target_hours     numeric not null default 40,
  last_course_date date,
  created_at       timestamptz not null default now()
);
create index if not exists idx_training_year on public.tbl_staff_training(year);
create index if not exists idx_training_staff on public.tbl_staff_training(staff_id);

-- ============================================================
-- FR-06 — Pemantauan Bajet Mengurus (OS28000 & OS26000)
-- ============================================================
create table if not exists public.tbl_budget_mengurus (
  id          uuid primary key default gen_random_uuid(),
  budget_code text not null check (budget_code in ('OS28000','OS26000')),
  month       date not null,
  allocation  numeric not null default 0,
  spent       numeric not null default 0,
  balance     numeric not null default 0,
  remarks     text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_budget_mengurus_code on public.tbl_budget_mengurus(budget_code);
create index if not exists idx_budget_mengurus_month on public.tbl_budget_mengurus(month);

-- ============================================================
-- FR-07 — Pemantauan Bajet Pembangunan
-- ============================================================
create table if not exists public.tbl_budget_pembangunan (
  id             uuid primary key default gen_random_uuid(),
  project_id     text,
  project_name   text not null,
  category       text check (category in ('Penyelenggaraan','Naik Taraf')),
  allocation     numeric not null default 0,
  spent          numeric not null default 0,
  completion_pct numeric not null default 0 check (completion_pct between 0 and 100),
  status         text not null default 'Belum Mula' check (status in ('Belum Mula','Dalam Pelaksanaan','Siap')),
  target_date    date,
  created_at     timestamptz not null default now()
);
create index if not exists idx_budget_pemb_status on public.tbl_budget_pembangunan(status);

-- ============================================================
-- FR-08 — Pemantauan Verifikasi Stok
-- ============================================================
create table if not exists public.tbl_stock_verification (
  id           uuid primary key default gen_random_uuid(),
  item_code    text not null,
  item_name    text not null,
  system_qty   int not null default 0,
  physical_qty int not null default 0,
  variance     int not null default 0,
  verified_by  text,
  verify_date  date,
  status       text not null default 'Sepadan' check (status in ('Sepadan','Percanggahan')),
  category     text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_stock_status on public.tbl_stock_verification(status);

-- ============================================================
-- FR-09 — Enrolmen Peserta Kursus Jangka Pendek
-- ============================================================
create table if not exists public.tbl_short_course_enrolment (
  id               uuid primary key default gen_random_uuid(),
  course_id        text,
  course_name      text not null,
  program_id       uuid references public.tbl_program(id) on delete set null,
  session_date     date not null,
  capacity         int not null default 0,
  participant_count int not null default 0,
  category         text check (category in ('Awam','Korporat')),
  revenue          numeric not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists idx_short_course_date on public.tbl_short_course_enrolment(session_date);

-- ============================================================
-- FR-10 — Senarai Pelajar Sepenuh Masa Bergraduat
-- ============================================================
create table if not exists public.tbl_graduates (
  id               uuid primary key default gen_random_uuid(),
  student_id       text,
  full_name        text not null,
  program_id       uuid references public.tbl_program(id) on delete set null,
  session_name     text,
  graduation_date  date,
  final_grade      text,
  employment_status text check (employment_status in ('Bekerja','Belum Bekerja','Melanjut Pelajaran')),
  created_at       timestamptz not null default now()
);
create index if not exists idx_graduates_session on public.tbl_graduates(session_name);
create index if not exists idx_graduates_employment on public.tbl_graduates(employment_status);

-- ============================================================
-- FR-11 — Pemantauan Akaun Amanah
-- ============================================================
create table if not exists public.tbl_trust_account (
  id               uuid primary key default gen_random_uuid(),
  transaction_type text not null check (transaction_type in ('Income','Expense')),
  category         text,
  amount           numeric not null default 0,
  transaction_date date not null,
  running_balance  numeric not null default 0,
  description      text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_trust_date on public.tbl_trust_account(transaction_date);

-- ============================================================
-- FR-12 — Pemantauan Akaun Mengurus
-- ============================================================
create table if not exists public.tbl_mengurus_account (
  id            uuid primary key default gen_random_uuid(),
  account_code  text not null,
  account_name  text not null,
  allocation    numeric not null default 0,
  spent         numeric not null default 0,
  month         date not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_mengurus_code on public.tbl_mengurus_account(account_code);

-- ============================================================
-- FR-13 — Pemantauan Aset (Semakan Aset)
-- ============================================================
create table if not exists public.tbl_asset_monitoring (
  id              uuid primary key default gen_random_uuid(),
  asset_code      text not null unique,
  asset_name      text not null,
  location        text,
  condition       text not null default 'Baik' check (condition in ('Baik','Rosak','Perlu Baiki')),
  last_check_date date,
  next_check_date date,
  status          text not null default 'Terkini' check (status in ('Terkini','Tertunggak')),
  category        text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_asset_status on public.tbl_asset_monitoring(status);
create index if not exists idx_asset_next_check on public.tbl_asset_monitoring(next_check_date);

-- ============================================================
-- FR-14 — Pemantauan Bilangan Komputer
-- ============================================================
create table if not exists public.tbl_computer_inventory (
  id            uuid primary key default gen_random_uuid(),
  computer_id   text,
  asset_tag     text not null unique,
  location      text,
  brand_model   text,
  purchase_year int,
  status        text not null default 'Berfungsi' check (status in ('Berfungsi','Rosak','Penyelenggaraan')),
  os_version    text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_computer_status on public.tbl_computer_inventory(status);
create index if not exists idx_computer_location on public.tbl_computer_inventory(location);

-- ============================================================
-- AUDIT LOG (PRD §7 — non-functional: audit trail)
-- ============================================================
create table if not exists public.tbl_audit_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  action     text not null check (action in ('CREATE','UPDATE','DELETE')),
  module     text,
  record_id  text,
  detail     text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on public.tbl_audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (PRD §5.2)
-- ============================================================
-- Enable RLS on ALL tables without exception.
alter table public.tbl_program                enable row level security;
alter table public.tbl_session                enable row level security;
alter table public.tbl_staff                  enable row level security;
alter table public.tbl_training_center        enable row level security;
alter table public.tbl_enrolment_fulltime     enable row level security;
alter table public.tbl_customer_complaints    enable row level security;
alter table public.tbl_program_accreditation  enable row level security;
alter table public.tbl_instructor_certification enable row level security;
alter table public.tbl_staff_training         enable row level security;
alter table public.tbl_budget_mengurus        enable row level security;
alter table public.tbl_budget_pembangunan     enable row level security;
alter table public.tbl_stock_verification     enable row level security;
alter table public.tbl_short_course_enrolment enable row level security;
alter table public.tbl_graduates              enable row level security;
alter table public.tbl_trust_account          enable row level security;
alter table public.tbl_mengurus_account       enable row level security;
alter table public.tbl_asset_monitoring       enable row level security;
alter table public.tbl_computer_inventory     enable row level security;
alter table public.tbl_audit_log              enable row level security;

-- SELECT policy: authenticated users (incl. anon for demo dashboard) can read all rows.
-- (Tighten per role in production via custom JWT claims — see PRD §5.2.)
drop policy if exists "allow_select_all" on public.tbl_program;
create policy "allow_select_all" on public.tbl_program
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_session;
create policy "allow_select_all" on public.tbl_session
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_staff;
create policy "allow_select_all" on public.tbl_staff
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_training_center;
create policy "allow_select_all" on public.tbl_training_center
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_enrolment_fulltime;
create policy "allow_select_all" on public.tbl_enrolment_fulltime
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_customer_complaints;
create policy "allow_select_all" on public.tbl_customer_complaints
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_program_accreditation;
create policy "allow_select_all" on public.tbl_program_accreditation
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_instructor_certification;
create policy "allow_select_all" on public.tbl_instructor_certification
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_staff_training;
create policy "allow_select_all" on public.tbl_staff_training
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_budget_mengurus;
create policy "allow_select_all" on public.tbl_budget_mengurus
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_budget_pembangunan;
create policy "allow_select_all" on public.tbl_budget_pembangunan
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_stock_verification;
create policy "allow_select_all" on public.tbl_stock_verification
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_short_course_enrolment;
create policy "allow_select_all" on public.tbl_short_course_enrolment
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_graduates;
create policy "allow_select_all" on public.tbl_graduates
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_trust_account;
create policy "allow_select_all" on public.tbl_trust_account
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_mengurus_account;
create policy "allow_select_all" on public.tbl_mengurus_account
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_asset_monitoring;
create policy "allow_select_all" on public.tbl_asset_monitoring
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_computer_inventory;
create policy "allow_select_all" on public.tbl_computer_inventory
  for select to anon, authenticated using (true);

drop policy if exists "allow_select_all" on public.tbl_audit_log;
create policy "allow_select_all" on public.tbl_audit_log
  for select to anon, authenticated using (true);

-- INSERT/UPDATE/DELETE: restricted to authenticated users with service_role
-- or custom claim is_admin = true (production hardening per PRD §5.2).
-- For demo simplicity, allow authenticated users to write.
do $$
declare t text;
begin
  for t in select unnest(array[
    'tbl_program','tbl_session','tbl_staff','tbl_training_center',
    'tbl_enrolment_fulltime','tbl_customer_complaints','tbl_program_accreditation',
    'tbl_instructor_certification','tbl_staff_training','tbl_budget_mengurus',
    'tbl_budget_pembangunan','tbl_stock_verification','tbl_short_course_enrolment',
    'tbl_graduates','tbl_trust_account','tbl_mengurus_account',
    'tbl_asset_monitoring','tbl_computer_inventory','tbl_audit_log'
  ])
  loop
    execute format('drop policy if exists "allow_write_auth" on public.%I', t);
    execute format('create policy "allow_write_auth" on public.%I for all to authenticated using (true) with check (true);', t);
  end loop;
end$$;

-- ============================================================
-- Schema complete.
-- ============================================================
