-- ============================================================
-- DUMMY / SEED DATA — Sistem Dashboard Pemantauan Bersepadu JTM
-- PRD §5.3 — Strategi Data Dummy
-- Run AFTER schema.sql. Safe to re-run (truncates first).
-- ============================================================

-- Clean slate (respect FK order)
truncate table
  public.tbl_audit_log,
  public.tbl_computer_inventory,
  public.tbl_asset_monitoring,
  public.tbl_mengurus_account,
  public.tbl_trust_account,
  public.tbl_graduates,
  public.tbl_short_course_enrolment,
  public.tbl_stock_verification,
  public.tbl_budget_pembangunan,
  public.tbl_budget_mengurus,
  public.tbl_staff_training,
  public.tbl_instructor_certification,
  public.tbl_program_accreditation,
  public.tbl_customer_complaints,
  public.tbl_enrolment_fulltime,
  public.tbl_training_center,
  public.tbl_session,
  public.tbl_staff,
  public.tbl_program
cascade;

-- ============================================================
-- LOOKUPS
-- ============================================================
insert into public.tbl_program (program_code, program_name, field, level, duration_mnth) values
  ('AUT-001','Teknologi Automotif','Automotif','SKM3',24),
  ('ELE-002','Teknologi Elektrik','Elektrik','SKM3',24),
  ('WLD-003','Kimpalan Arka Logam','Pembuatan','SKM3',18),
  ('IT-004','Teknologi Maklumat & Sokongan','ICT','DKM',30),
  ('MEC-005','Pemesinan CNC','Pembuatan','DKM',30),
  ('AC-006','Penyaman Udara & Pemulaan','Elektrik','SKM3',18),
  ('CIV-007','Kejuruteraan Awam','Pembinaan','DKM',30),
  ('FNB-008','Pengurusan Katering','Hospitaliti','SKM3',18),
  ('BTS-009','Pemasangan Bangunan','Pembinaan','DLKM',36),
  ('FRZ-010','Teknologi Penyejuk Beku','Elektrik','SKM3',18);

insert into public.tbl_session (session_name, start_date, end_date) values
  ('Sesi Disember 2024','2024-12-01','2025-05-31'),
  ('Sesi Jun 2025','2025-06-01','2025-11-30'),
  ('Sesi Disember 2025','2025-12-01','2026-05-31'),
  ('Sesi Jun 2026','2026-06-01','2026-11-30');

insert into public.tbl_staff (staff_no, full_name, department, position, email) values
  ('JTM-1001','Ahmad Bin Zulkifli','Jabatan Automotif','Pengajar','staff1@jtm.gov.my'),
  ('JTM-1002','Nurul Aini Binti Hassan','Jabatan Elektrik','Pegawai','staff2@jtm.gov.my'),
  ('JTM-1003','Siti Khadijah Binti Omar','Jabatan Pembuatan','Pengajar','staff3@jtm.gov.my'),
  ('JTM-1004','Muhammad Faiz Bin Rahman','Jabatan ICT','Pegawai','staff4@jtm.gov.my'),
  ('JTM-1005','Fatimah Binti Yusof','Pentadbiran','Pegawai Sokongan','staff5@jtm.gov.my'),
  ('JTM-1006','Rajesh a/l Kumar','Jabatan Elektrik','Penolong Pegawai','staff6@jtm.gov.my'),
  ('JTM-1007','Lim Wei Jie','Jabatan ICT','Pengajar','staff7@jtm.gov.my'),
  ('JTM-1008','Aisyah Binti Abdullah','Pentadbiran','Pegawai','staff8@jtm.gov.my'),
  ('JTM-1009','Mohd Hafiz Bin Ibrahim','Jabatan Automotif','Pengajar','staff9@jtm.gov.my'),
  ('JTM-1010','Priya a/p Subramaniam','Kewangan','Pegawai','staff10@jtm.gov.my'),
  ('JTM-1011','Tan Chee Keong','Jabatan Pembinaan','Pengajar','staff11@jtm.gov.my'),
  ('JTM-1012','Zulkifli Bin Mohamad','Jabatan Automotif','Penolong Pegawai','staff12@jtm.gov.my'),
  ('JTM-1013','Nur Hidayah Binti Aziz','Jabatan Hospitaliti','Pengajar','staff13@jtm.gov.my'),
  ('JTM-1014','Chong Wei Ming','Jabatan Pembuatan','Pengajar','staff14@jtm.gov.my'),
  ('JTM-1015','Kumaravel a/l Samy','Jabatan Elektrik','Pengajar','staff15@jtm.gov.my'),
  ('JTM-1016','Rosnah Binti Mohamed','Pentadbiran','Pegawai Sokongan','staff16@jtm.gov.my'),
  ('JTM-1017','Hafizul Bin Che Hasan','Jabatan ICT','Penolong Pegawai','staff17@jtm.gov.my'),
  ('JTM-1018','Wong Sze Fei','Jabatan Pembinaan','Pengajar','staff18@jtm.gov.my'),
  ('JTM-1019','Farah Nadia Binti Hashim','Kewangan','Pegawai','staff19@jtm.gov.my'),
  ('JTM-1020','Suresh a/l Maniam','Jabatan Automotif','Pengajar','staff20@jtm.gov.my');

insert into public.tbl_training_center (center_code, center_name, state) values
  ('ILP-KL','ILP Kuala Lumpur','Wilayah Persekutuan Kuala Lumpur'),
  ('ILP-SL','ILP Selayang','Selangor'),
  ('IKM-KS','IKM Kuala Selangor','Selangor'),
  ('ILP-TP','ILP Tapah','Perak'),
  ('IKM-LG','IKM Ledang','Johor'),
  ('ILP-PG','ILP Pagoh','Johor'),
  ('IKM-JS','IKM Jasin','Melaka'),
  ('ILP-KB','ILP Kota Bharu','Kelantan');

-- ============================================================
-- FR-01 — Enrolment Full-time (32 rows)
-- ============================================================
insert into public.tbl_enrolment_fulltime
  (session_name, program_id, target_intake, actual_enrolled, center_name, gender_male, gender_female)
select
  s.session_name,
  (select id from public.tbl_program order by random() limit 1),
  target,
  enrolled,
  c.center_name,
  male,
  enrolled - male
from public.tbl_session s
cross join (select * from public.tbl_training_center limit 8) c
cross join lateral (
  select
    (80 + floor(random()*61))::int as target,
    (80 + floor(random()*61))::int * (0.65 + random()*0.4)::int as enrolled,
    (80 + floor(random()*61))::int * (0.55 + random()*0.15)::int as male
) v
limit 32;

-- ============================================================
-- FR-02 — Customer Complaints (28 rows)
-- ============================================================
insert into public.tbl_customer_complaints
  (complaint_ref, date_received, category, status, date_resolved, response_time_hours, sla_target_hours, complainant_type, description)
select
  'ADN-' || (2026000 + g),
  (current_date - (random()*90)::int),
  (array['Akademik','Kemudahan','Kewangan','ICT'])[1 + floor(random()*4)::int],
  case when random() < 0.6 then 'Selesai' when random() < 0.5 then 'Dalam Tindakan' else 'Baharu' end,
  case when random() < 0.6 then (current_date - (random()*70)::int) else null end,
  case when random() < 0.6 then (6 + random()*90)::numeric else null end,
  72,
  (array['Pelajar','Ibu Bapa','Majikan','Awam'])[1 + floor(random()*4)::int],
  'Aduan diterima melalui portal Khidmat Pelanggan JTM.'
from generate_series(1, 28) g;

-- ============================================================
-- FR-03 — Program Accreditation (10 rows, one per program)
-- ============================================================
insert into public.tbl_program_accreditation
  (program_id, program_name, accreditation_body, cert_no, start_date, expiry_date, status)
select
  p.id,
  p.program_name,
  (array['JPK','MQA','DSD'])[1 + floor(random()*3)::int],
  'ACC-' || (2022 + floor(random()*4)::int) || '-' || lpad(g::text, 4, '0'),
  (current_date - (200 + floor(random()*1300))::int),
  (current_date + d),
  case when d < 0 then 'Luput' when d <= 90 then 'Akan Luput' else 'Aktif' end
from public.tbl_program p
cross join lateral (
  select (array[-400,-30,20,45,80,120,250,600,900,1200])[g]::int as d
) v
with ordinality as t(g, d)
where p.program_code in ('AUT-001','ELE-002','WLD-003','IT-004','MEC-005','AC-006','CIV-007','FNB-008','BTS-009','FRZ-010');

-- ============================================================
-- FR-04 — Instructor Certification (25 rows; ~11 uncertified)
-- ============================================================
insert into public.tbl_instructor_certification
  (full_name, department, cert_level, cert_no, issue_date, expiry_date)
select
  name,
  dept,
  case when g <= 14 then lvl else null end,
  case when g <= 14 then lvl || '-' || (2020 + floor(random()*5)) || '-' || lpad(g::text,4,'0') else null end,
  case when g <= 14 then (current_date - (200 + floor(random()*1300))::int) else null end,
  case when g <= 14 and random() > 0.7 then (current_date + (10 + floor(random()*190))::int) else null end
from (
  select 'Pengajar ' || g as name,
         (array['Jabatan Automotif','Jabatan Elektrik','Jabatan Pembuatan','Jabatan ICT','Jabatan Pembinaan','Jabatan Hospitaliti','Pentadbiran','Kewangan'])[1 + floor(random()*8)::int] as dept,
         (array['SKM3','DKM','DLKM'])[1 + floor(random()*3)::int] as lvl,
         g
  from generate_series(1, 25) g
) x;

-- ============================================================
-- FR-05 — Staff Training 2026 (20 rows)
-- ============================================================
insert into public.tbl_staff_training
  (staff_id, full_name, department, year, hours_completed, target_hours, last_course_date)
select
  s.id, s.full_name, s.department, 2026,
  (8 + floor(random()*39))::numeric,
  40,
  (current_date - (5 + floor(random()*195))::int)
from public.tbl_staff s;

-- ============================================================
-- FR-06 — Budget Mengurus (OS28000 & OS26000, Jan-Jul 2026)
-- ============================================================
insert into public.tbl_budget_mengurus
  (budget_code, month, allocation, spent, balance, remarks)
select
  code,
  make_date(2026, m, 1),
  alloc,
  round(alloc * (0.55 + random()*0.5))::numeric,
  0,
  (array['Perbelanjaan dalam julat normal','Pemantauan diperlukan',''])[1 + floor(random()*3)::int]
from (values ('OS28000', 160000), ('OS26000', 80000)) as v(code, base)
cross join generate_series(1, 7) as m
cross join lateral (
  select (base + floor(random()*40000))::numeric as alloc
) a;
-- recompute balance
update public.tbl_budget_mengurus set balance = allocation - spent;

-- ============================================================
-- FR-07 — Budget Pembangunan (8 projects)
-- ============================================================
insert into public.tbl_budget_pembangunan
  (project_name, category, allocation, spent, completion_pct, status, target_date)
select
  name,
  cat,
  alloc,
  round(alloc * (comp/100.0) * (0.85 + random()*0.3))::numeric,
  comp,
  case when comp > 85 then 'Siap' when comp > 0 then 'Dalam Pelaksanaan' else 'Belum Mula' end,
  (current_date + (floor(random()*270) - 30)::int)
from (
  values
    ('Naik Taraf Makmal Automotif','Naik Taraf',520000,62),
    ('Penyelenggaraan Sistem Pendingin Auditorium','Penyelenggaraan',180000,90),
    ('Naik Taraf Makmal CNC','Naik Taraf',750000,45),
    ('Penyelenggaraan Struktur Bumbung Blok B','Penyelenggaraan',240000,100),
    ('Pemasangan Sistem Solar PV','Naik Taraf',850000,30),
    ('Naik Taraf Makmal Elektrik','Naik Taraf',430000,55),
    ('Penyelenggaraan Sistem Bomba','Penyelenggaraan',210000,75),
    ('Naik Taraf Pusat Sumber','Naik Taraf',320000,20)
) as t(name, cat, alloc, comp);

-- ============================================================
-- FR-08 — Stock Verification (18 items)
-- ============================================================
insert into public.tbl_stock_verification
  (item_code, item_name, system_qty, physical_qty, variance, verified_by, verify_date, status, category)
select
  code, name, sq, sq + vr, vr,
  (array['Ahmad Bin Zulkifli','Nurul Aini Binti Hassan','Siti Khadijah Binti Omar','Muhammad Faiz Bin Rahman'])[1 + floor(random()*4)::int],
  (current_date - (1 + floor(random()*59))::int),
  case when abs(vr) <= 2 then 'Sepadan' else 'Percanggahan' end,
  cat
from (
  values
    ('STK-001','Kertas A4 80gsm (rim)',150,0,'Alat Tulis'),
    ('STK-002','Toner HP CF259A',24,-3,'ICT'),
    ('STK-003','Kabel PVC 2.5mm (gulung)',60,1,'Elektrik'),
    ('STK-004','Elektrod Kimpalan E6013 (kotak)',18,-5,'Pembuatan'),
    ('STK-005','Minyak Enjin SAE 40 (liter)',80,0,'Automotif'),
    ('STK-006','Cat Industri Putih (tin)',35,-8,'Pembinaan'),
    ('STK-007','Pemutus Litar 32A',48,2,'Elektrik'),
    ('STK-008','Mata Gerudi 6mm',120,-12,'Pembuatan'),
    ('STK-009','Pen Marker Pelbagai Warna',200,-4,'Alat Tulis'),
    ('STK-010','Pita Penebat Elektrik',90,1,'Elektrik'),
    ('STK-011','Sarung Tangan Lasak',60,-10,'Automotif'),
    ('STK-012','Cecair Pendingin Enjin (liter)',45,0,'Automotif'),
    ('STK-013','Fail Plastik A4',180,-6,'Alat Tulis'),
    ('STK-014','Stapler Gun',30,0,'Alat Tulis'),
    ('STK-015','Cakera Pemotong 4" ',55,-7,'Pembuatan'),
    ('STK-016','Wayar Soket 13A',75,3,'Elektrik'),
    ('STK-017','Lampu LED 18W',110,-2,'Elektrik'),
    ('STK-018','Roda Pengilap',40,-9,'Pembuatan')
) as t(code, name, sq, vr, cat);

-- ============================================================
-- FR-09 — Short Course Enrolment (12 courses)
-- ============================================================
insert into public.tbl_short_course_enrolment
  (course_name, program_id, session_date, capacity, participant_count, category, revenue)
select
  name,
  (select id from public.tbl_program order by random() limit 1),
  (current_date - (5 + floor(random()*115))::int),
  cap,
  round(cap * (0.55 + random()*0.5))::int,
  (array['Awam','Korporat'])[1 + floor(random()*2)::int],
  round(cap * (0.55 + random()*0.5))::int * (350 + floor(random()*851))
from (
  values
    ('Pengaturcaraan Web Asas',30),
    ('Pemesinan CNC Tahap Pengenalan',25),
    ('Penyelenggaraan Kenderaan Hybrid',28),
    ('Reka Bentuk Grafik Digital',35),
    ('Pemasangan Solar PV',32),
    ('Kimpalan TIG Asas',24),
    ('Pengurusan Kafe & Barista',30),
    ('Penyaman Udara Domestik',26),
    ('Pemulihan & Penyelenggaraan Komputer',34),
    ('Fotografi Digital Profesional',28),
    ('Pemasangan Pintar Rumah (Smart Home)',30),
    ('Analisis Data Excel Lanjutan',32)
) as t(name, cap);

-- ============================================================
-- FR-10 — Graduates (per session, ~30 each)
-- ============================================================
insert into public.tbl_graduates
  (full_name, program_id, session_name, graduation_date, final_grade, employment_status)
select
  'Graduan ' || g,
  (select id from public.tbl_program order by random() limit 1),
  s.session_name,
  (current_date - (30 + floor(random()*470))::int),
  (array['A','A-','B+','B','B-','C+'])[1 + floor(random()*6)::int],
  (array['Bekerja','Bekerja','Bekerja','Belum Bekerja','Melanjut Pelajaran'])[1 + floor(random()*5)::int]
from public.tbl_session s
cross join generate_series(1, 30 + floor(random()*16)::int) g;

-- ============================================================
-- FR-11 — Trust Account (24 transactions, running balance)
-- ============================================================
insert into public.tbl_trust_account
  (transaction_type, category, amount, transaction_date, running_balance, description)
with txns as (
  select
    case when random() > 0.45 then 'Income' else 'Expense' end as ttype,
    case when random() > 0.45
      then (array['Yuran Kursus Jangka Pendek','Sewa Kemudahan','Jualan Projek','Derma'])[1 + floor(random()*4)::int]
      else (array['Bahan Guna Habis','Penyelenggaraan','Utiliti','Insentif'])[1 + floor(random()*4)::int]
    end as cat,
    case when random() > 0.45
      then (8000 + floor(random()*27001))::numeric
      else (5000 + floor(random()*23001))::numeric
    end as amt,
    (current_date - (1 + floor(random()*199))::int) as dte
  from generate_series(1, 24)
)
select
  ttype, cat, amt, dte,
  sum(case when ttype = 'Income' then amt else -amt end)
    over (order by dte rows unbounded preceding) + 250000 as rb,
  case when ttype = 'Income' then 'Penerimaan pendapatan Akaun Amanah' else 'Perbelanjaan Akaun Amanah' end
from txns;

-- ============================================================
-- FR-12 — Mengurus Account (6 codes)
-- ============================================================
insert into public.tbl_mengurus_account
  (account_code, account_name, allocation, spent, month)
select
  code, name,
  alloc,
  round(alloc * (0.4 + random()*0.55))::numeric,
  make_date(2026, 6, 1)
from (
  values
    ('21000','Gaji & Elaun Tahunan',1500000),
    ('27000','Perkhidmatan',800000),
    ('28000','Penyelenggaraan',450000),
    ('26000','Bekalan & Bahan Guna Habis',320000),
    ('29000','Peralatan',600000),
    ('23000','Perjalanan & Pengangkutan',300000)
) as t(code, name, alloc);

-- ============================================================
-- FR-13 — Asset Monitoring (15 assets)
-- ============================================================
insert into public.tbl_asset_monitoring
  (asset_code, asset_name, location, condition, last_check_date, next_check_date, status, category)
select
  code, name, loc, cond,
  (current_date - (10 + floor(random()*290))::int),
  (current_date + d),
  case when d < 0 then 'Tertunggak' else 'Terkini' end,
  cat
from (
  values
    ('KEW.PA-0231','Projektor LCD','Bilik Kuliah A1','Baik',200,'Pengajaran'),
    ('KEW.PA-0455','Mesin Kimpalan CNC','Makmal Kimpalan 2','Perlu Baiki',-30,'Peralatan Bengkel'),
    ('KEW.PA-0678','Penghawa Dingin 2HP','Pejabat Pentadbiran','Baik',180,'Kemudahan'),
    ('KEW.PA-0912','Komputer Makmal Dell','Makmal Komputer 3','Baik',120,'ICT'),
    ('KEW.PA-1023','Mesin Jahit Industri','Bengkel Jahitan','Rosak',-45,'Peralatan Bengkel'),
    ('KEW.PA-1156','Mesin Gerudi Lantai','Bengkel Mesin','Baik',90,'Peralatan Bengkel'),
    ('KEW.PA-1278','Papan Putih Interaktif','Bilik Kuliah B2','Baik',150,'Pengajaran'),
    ('KEW.PA-1345','Pencetak Laser 3D','Makmal Inovasi','Perlu Baiki',60,'ICT'),
    ('KEW.PA-1422','Dapur Gas Komersial','Dapur Latihan Katering','Baik',110,'Kemudahan'),
    ('KEW.PA-1587','Mesin Pemesin CNC Lathe','Bengkel CNC','Baik',75,'Peralatan Bengkel'),
    ('KEW.PA-1644','Skru Pemampat Udara','Bengkel Automotif','Perlu Baiki',-10,'Peralatan Bengkel'),
    ('KEW.PA-1789','Penjana Kuasa 10kVA','Bilik Janakuasa','Baik',130,'Kemudahan'),
    ('KEW.PA-1823','Kamera DSLR Latihan','Studio Fotografi','Baik',95,'ICT'),
    ('KEW.PA-1901','Simulator Pemanduan','Bengkel Automotif','Rosak',-60,'Peralatan Bengkel'),
    ('KEW.PA-2055','Sistem PA Auditorium','Auditorium','Baik',140,'Kemudahan')
) as t(code, name, loc, cond, d, cat);

-- ============================================================
-- FR-14 — Computer Inventory (75 units)
-- ============================================================
insert into public.tbl_computer_inventory
  (asset_tag, location, brand_model, purchase_year, status, os_version)
select
  'PC-' || lpad(g::text, 5, '0'),
  lab,
  brand,
  yr,
  case when r > 0.85 then 'Rosak' when r > 0.75 then 'Penyelenggaraan' else 'Berfungsi' end,
  os
from generate_series(10001, 10075) g
cross join lateral (
  select
    (array['Makmal Komputer 1','Makmal Komputer 2','Makmal Komputer 3','Makmal CAD/CAM','Pejabat Pentadbiran','Pusat Sumber'])[1 + floor(random()*6)::int] as lab,
    (array['Dell OptiPlex 7080','HP ProDesk 600 G6','Lenovo ThinkCentre M90','Dell Precision 3650','Asus ExpertCenter D7'])[1 + floor(random()*5)::int] as brand,
    (2018 + floor(random()*7)::int) as yr,
    random() as r,
    (array['Windows 11 Pro','Windows 10 Pro'])[1 + floor(random()*2)::int] as os
) v;

-- ============================================================
-- Audit Log (sample entries)
-- ============================================================
insert into public.tbl_audit_log (user_id, action, module, record_id, detail)
select
  (select id from public.tbl_staff order by random() limit 1),
  (array['CREATE','UPDATE','DELETE'])[1 + floor(random()*3)::int],
  (array['FR-01','FR-02','FR-06','FR-13'])[1 + floor(random()*4)::int],
  'rec-' || g,
  'Pengemaskinian rekod oleh pegawai bertugas.'
from generate_series(1000, 1007) g;

-- ============================================================
-- Seed complete.
-- ============================================================
select 'Seed data loaded successfully' as status,
       (select count(*) from public.tbl_enrolment_fulltime) as fr01,
       (select count(*) from public.tbl_customer_complaints) as fr02,
       (select count(*) from public.tbl_program_accreditation) as fr03,
       (select count(*) from public.tbl_instructor_certification) as fr04,
       (select count(*) from public.tbl_staff_training) as fr05,
       (select count(*) from public.tbl_budget_mengurus) as fr06,
       (select count(*) from public.tbl_budget_pembangunan) as fr07,
       (select count(*) from public.tbl_stock_verification) as fr08,
       (select count(*) from public.tbl_short_course_enrolment) as fr09,
       (select count(*) from public.tbl_graduates) as fr10,
       (select count(*) from public.tbl_trust_account) as fr11,
       (select count(*) from public.tbl_mengurus_account) as fr12,
       (select count(*) from public.tbl_asset_monitoring) as fr13,
       (select count(*) from public.tbl_computer_inventory) as fr14;
