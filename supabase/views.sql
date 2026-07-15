-- ============================================================
-- AGGREGATE VIEWS — Sistem Dashboard Pemantauan Bersepadu JTM
-- PRD §5.4 — Fungsi & View Agregat
-- Run AFTER schema.sql + seed.sql
-- ============================================================

-- FR-01 — Enrolment summary per session
create or replace view public.vw_enrolment_summary as
select
  session_name,
  sum(target_intake)   as total_target,
  sum(actual_enrolled) as total_enrolled,
  round(100.0 * sum(actual_enrolled) / nullif(sum(target_intake), 0), 1) as pct_achieved
from public.tbl_enrolment_fulltime
group by session_name
order by session_name;

-- FR-02 — Complaint SLA summary
create or replace view public.vw_complaint_summary as
select
  count(*) as total,
  count(*) filter (where status = 'Selesai') as resolved,
  count(*) filter (where status <> 'Selesai') as open_cases,
  count(*) filter (where status = 'Selesai' and response_time_hours <= sla_target_hours) as within_sla,
  round(100.0 * count(*) filter (where status = 'Selesai' and response_time_hours <= sla_target_hours)
        / nullif(count(*) filter (where status = 'Selesai'), 0), 1) as sla_pct,
  round(avg(response_time_hours) filter (where status = 'Selesai'), 1) as avg_response_hours
from public.tbl_customer_complaints;

-- FR-03 — Accreditation status buckets
create or replace view public.vw_accreditation_summary as
select
  count(*) as total,
  count(*) filter (where status = 'Aktif') as active,
  count(*) filter (where status = 'Akan Luput') as expiring,
  count(*) filter (where status = 'Luput') as expired,
  count(*) filter (where expiry_date is not null and expiry_date - current_date between 0 and 90) as within_90_days
from public.tbl_program_accreditation;

-- FR-04 — Instructor certification by level
create or replace view public.vw_instructor_cert_summary as
select
  count(*) as total,
  count(*) filter (where cert_level is not null) as certified,
  count(*) filter (where cert_level is null) as uncertified,
  count(*) filter (where cert_level = 'SKM3') as skm3,
  count(*) filter (where cert_level = 'DKM') as dkm,
  count(*) filter (where cert_level = 'DLKM') as dlkm,
  round(100.0 * count(*) filter (where cert_level is not null) / nullif(count(*), 0), 1) as pct_certified
from public.tbl_instructor_certification;

-- FR-05 — Staff training compliance
create or replace view public.vw_staff_training_summary as
select
  count(*) as total_staff,
  count(*) filter (where hours_completed >= target_hours) as compliant,
  count(*) filter (where hours_completed < target_hours * 0.6) as at_risk,
  round(avg(hours_completed), 1) as avg_hours,
  round(100.0 * count(*) filter (where hours_completed >= target_hours) / nullif(count(*), 0), 1) as pct_compliant
from public.tbl_staff_training;

-- FR-06/12 — Budget mengurus summary
create or replace view public.vw_budget_mengurus_summary as
select
  budget_code,
  sum(allocation) as total_allocation,
  sum(spent) as total_spent,
  sum(balance) as total_balance,
  round(100.0 * sum(spent) / nullif(sum(allocation), 0), 1) as pct_used
from public.tbl_budget_mengurus
group by budget_code;

-- FR-07 — Budget pembangunan summary
create or replace view public.vw_budget_pembangunan_summary as
select
  count(*) as total_projects,
  count(*) filter (where status = 'Dalam Pelaksanaan') as in_progress,
  count(*) filter (where status = 'Siap') as completed,
  sum(allocation) as total_allocation,
  sum(spent) as total_spent,
  round(avg(completion_pct), 1) as avg_completion
from public.tbl_budget_pembangunan;

-- FR-08 — Stock verification accuracy
create or replace view public.vw_stock_verification_summary as
select
  count(*) as total,
  count(*) filter (where status = 'Sepadan') as matched,
  count(*) filter (where status = 'Percanggahan') as mismatched,
  round(100.0 * count(*) filter (where status = 'Sepadan') / nullif(count(*), 0), 1) as accuracy_pct
from public.tbl_stock_verification;

-- FR-09 — Short course summary
create or replace view public.vw_short_course_summary as
select
  count(*) as total_courses,
  sum(capacity) as total_capacity,
  sum(participant_count) as total_participants,
  sum(revenue) as total_revenue,
  round(100.0 * sum(participant_count) / nullif(sum(capacity), 0), 1) as fill_pct
from public.tbl_short_course_enrolment;

-- FR-10 — Graduates employability
create or replace view public.vw_graduates_summary as
select
  count(*) as total,
  count(*) filter (where employment_status = 'Bekerja') as employed,
  count(*) filter (where employment_status = 'Melanjut Pelajaran') as further_studies,
  count(*) filter (where employment_status = 'Belum Bekerja') as unemployed,
  round(100.0 * count(*) filter (where employment_status = 'Bekerja') / nullif(count(*), 0), 1) as employability_pct
from public.tbl_graduates;

-- FR-11 — Trust account cash flow
create or replace view public.vw_trust_account_summary as
select
  sum(amount) filter (where transaction_type = 'Income') as total_income,
  sum(amount) filter (where transaction_type = 'Expense') as total_expense,
  (sum(amount) filter (where transaction_type = 'Income')
   - sum(amount) filter (where transaction_type = 'Expense')) as net,
  (select running_balance from public.tbl_trust_account order by transaction_date desc limit 1) as current_balance,
  round(
    sum(amount) filter (where transaction_type = 'Income')
    / nullif(sum(amount) filter (where transaction_type = 'Expense'), 0), 2
  ) as income_expense_ratio
from public.tbl_trust_account;

-- FR-13 — Asset monitoring summary
create or replace view public.vw_asset_summary as
select
  count(*) as total,
  count(*) filter (where condition = 'Baik') as baik,
  count(*) filter (where condition = 'Perlu Baiki') as perlu_baiki,
  count(*) filter (where condition = 'Rosak') as rosak,
  count(*) filter (where status = 'Tertunggak') as overdue,
  round(100.0 * count(*) filter (where status = 'Terkini') / nullif(count(*), 0), 1) as compliance_pct
from public.tbl_asset_monitoring;

-- FR-14 — Computer inventory summary
create or replace view public.vw_computer_summary as
select
  count(*) as total,
  count(*) filter (where status = 'Berfungsi') as functioning,
  count(*) filter (where status = 'Penyelenggaraan') as maintenance,
  count(*) filter (where status = 'Rosak') as broken,
  count(*) filter (where purchase_year <= 2020) as needs_replacement,
  round(100.0 * count(*) filter (where status = 'Berfungsi') / nullif(count(*), 0), 1) as functioning_pct
from public.tbl_computer_inventory;

-- Master executive summary (one row, all 14 modules' headline KPIs)
create or replace view public.vw_executive_summary as
select
  (select pct_achieved from public.vw_enrolment_summary order by session_name desc limit 1) as fr01_enrolment_pct,
  (select sla_pct from public.vw_complaint_summary) as fr02_sla_pct,
  (select within_90_days from public.vw_accreditation_summary) as fr03_expiring_90d,
  (select pct_certified from public.vw_instructor_cert_summary) as fr04_certified_pct,
  (select pct_compliant from public.vw_staff_training_summary) as fr05_compliance_pct,
  (select pct_used from public.vw_budget_mengurus_summary where budget_code = 'OS28000') as fr06_os28_pct,
  (select avg_completion from public.vw_budget_pembangunan_summary) as fr07_avg_completion,
  (select accuracy_pct from public.vw_stock_verification_summary) as fr08_accuracy_pct,
  (select fill_pct from public.vw_short_course_summary) as fr09_fill_pct,
  (select employability_pct from public.vw_graduates_summary) as fr10_employability_pct,
  (select income_expense_ratio from public.vw_trust_account_summary) as fr11_ratio,
  (select pct_used from public.vw_budget_mengurus_summary where budget_code = 'OS26000') as fr12_pct,
  (select compliance_pct from public.vw_asset_summary) as fr13_compliance_pct,
  (select functioning_pct from public.vw_computer_summary) as fr14_functioning_pct;

-- ============================================================
-- Views complete. Test with:
--   select * from public.vw_executive_summary;
-- ============================================================
