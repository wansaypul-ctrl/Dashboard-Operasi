#### **JABATAN TENAGA MANUSIA (JTM)** 

KEMENTERIAN SUMBER MANUSIA MALAYSIA 

# **DOKUMEN KEPERLUAN PRODUK** 

**(PRODUCT REQUIREMENTS DOCUMENT — PRD)** 

## **Sistem Dashboard Pemantauan Bersepadu** 

_Integrated Monitoring Dashboard System — ILP / IKM Operations_ 

|**Perkara**|**Butran**|
|---|---|
|Versi Dokumen|1.0|
|Tarikh Terbitan|14 Julai 2026|
|Status|Draf untuk Kelulusan|
|AI Development Engine|z.ai — Model GLM 5.2|
|Backend / Database|Supabase (PostgreSQL, Auth, Storage, Realtme)|
|Hostng / Deployment|Netlify (CI/CD)|
|Reka Bentuk UI/UX|Glassmorphism — Modern Responsive Design|
|Klasifkasi|Terhad — Kegunaan Dalaman|



_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **Isi Kandungan** 

|1. Pengenalan**.................................................................................................................................. 3**|
|---|
|2. Pemegang Taruh & Peranan Pengguna**..........................................................................................5**|
|3. Seni Bina Teknikal Sistem**..............................................................................................................6**|
|4. Keperluan Fungsian — Modul Dashboard**......................................................................................8**|
|5. Reka Bentuk Pangkalan Data (Supabase)**.....................................................................................16**|
|6. Reka Bentuk UI/UX — Glassmorphism**........................................................................................18**|
|7. Keperluan Bukan Fungsian**..........................................................................................................20**|
|8. Pelan Penempatan (Deployment Plan)**........................................................................................21**|
|9. Pelan Pengujian (Testng Plan)**....................................................................................................22**|
|10. Garis Masa Projek & Pencapaian Utama**....................................................................................23**|
|11. Risiko & Strategi Mitgasi**..........................................................................................................24**|
|12. Lampiran**..................................................................................................................................25**|



Muka Surat 1 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **1.  Pengenalan** 

#### **1.1 Latar Belakang** 

Jabatan Tenaga Manusia (JTM) melalui rangkaian Institut Latihan Perindustrian (ILP) dan Institut Kemahiran Mahir (IKM) di seluruh Malaysia menguruskan pelbagai aspek operasi harian merangkumi akademik, kewangan, aset dan sumber manusia. Pada masa kini, pemantauan bagi setiap aspek ini dijalankan secara berasingan menggunakan sistem legasi dan hamparan Excel manual, menyebabkan kesukaran mendapatkan gambaran menyeluruh (single source of truth) bagi membuat keputusan strategik secara tepat pada masanya. 

Sistem Dashboard Pemantauan Bersepadu dicadangkan untuk menggabungkan 14 domain pemantauan kritikal ke dalam satu platform digital tunggal yang responsif, selamat dan mesra pengguna, dibina menggunakan seni bina moden berasaskan awan (cloud-native). 

#### **1.2 Objektif Projek** 

- Menyediakan satu platform dashboard bersepadu bagi memantau prestasi akademik, kewangan, aset dan sumber manusia ILP/IKM secara masa nyata (real-time). 

- Mengautomasikan pengiraan KPI dan penjanaan amaran (alert) bagi perkara kritikal seperti tarikh luput pentauliahan program dan pematuhan bajet. 

- Mengurangkan pergantungan kepada proses manual berasaskan Excel dan e-mel bagi pelaporan pengurusan. 

- Menyediakan antara muka pengguna moden bergaya Glassmorphism yang meningkatkan pengalaman pengguna (UX) golongan pentadbir dan pengurusan atasan. 

- Membolehkan capaian sistem dari mana-mana peranti melalui pelayar web tanpa keperluan pemasangan perisian tambahan. 

- Memanfaatkan keupayaan AI (z.ai GLM 5.2) bagi menjana ringkasan analitik, insight automatik dan sokongan carian bahasa semula jadi. 

#### **1.3 Skop Projek** 

Skop pembangunan Fasa 1 merangkumi pembangunan 14 modul pemantauan dashboard seperti disenaraikan dalam Bahagian 4, lengkap dengan pangkalan data Supabase berfungsi penuh (termasuk data dummy/pra-populasi bagi tujuan demonstrasi dan ujian), reka bentuk UI/UX Glassmorphism responsif, serta penempatan (deployment) automatik ke persekitaran pengeluaran (production) di Netlify. 

Skop TIDAK termasuk (Fasa 2 dan seterusnya): modul pengurusan peperiksaan penuh, sistem e-pembelajaran (LMS), integrasi sistem gaji, dan aplikasi mobile native (iOS/Android). 

#### **1.4 Definisi & Akronim** 

|**Istlah**|**Penerangan**|
|---|---|
|JTM|Jabatan Tenaga Manusia|
|ILP / IKM|Insttut Lathan Perindustrian / Insttut Kemahiran Mahir|
|SKM / DKM / DLKM|Sijil / Diploma / Diploma Lanjutan Kemahiran Malaysia|
|DV|Dual Vocatonal (Pengajar Lathan Dwi Sistem)|
|PRD|Product Requirements Document|
|RLS|Row Level Security (kawalan akses baris data Supabase)|
|SLA|Service Level Agreement|



Muka Surat 2 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

|**Istlah**|**Penerangan**|
|---|---|
|GLM 5.2|Model bahasa besar (LLM) terbitan z.ai digunakan sebagai enjin pembangunan &<br>analitk AI|
|CI/CD|Contnuous Integraton / Contnuous Deployment|
|OS28000 / OS26000|Kod Objek Am Bajet Mengurus (Penyelenggaraan / Bekalan)|



Muka Surat 3 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **2.  Pemegang Taruh & Peranan Pengguna** 

Sistem akan menggunakan kawalan akses berasaskan peranan (Role-Based Access Control) yang dikuatkuasakan melalui Supabase Auth dan Row Level Security (RLS). 

|**Peranan**|**Capaian Sistem**|**Contoh Pengguna**|
|---|---|---|
|Super Admin|Capaian penuh semua modul, pengurusan<br>pengguna & tetapan sistem|Pengarah ICT / Pentadbir Sistem|
|Pengurus Kanan (Top<br>Management)|Papar sahaja (read-only) — semua 14 modul<br>dashboard peringkat ringkasan|Pengarah ILP/IKM, Timbalan<br>Pengarah|
|Pengurus Unit/Bahagian|Papar & urus data bagi modul di bawah bidang<br>kuasa sahaja|Pengurus Akademik, Pengurus<br>Kewangan, Pengurus Aset|
|Pegawai Input Data|Kemasukan & kemas kini data mentah bagi<br>modul berkaitan|Pegawai Rekod, Pegawai Stor,<br>Pegawai ICT|
|Pelawat/Auditor (Guest)|Papar laporan terpilih sahaja, tada capaian<br>kemas kini|Pihak Audit Dalaman/Luaran|



Muka Surat 4 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **3.  Seni Bina Teknikal Sistem** 

#### **3.1 Ringkasan Tumpukan Teknologi (Tech Stack)** 

|**Lapisan**|**Teknologi**|**Catatan**|
|---|---|---|
|Enjin Pembangunan AI|z.ai — Model GLM 5.2|Digunakan sebagai pair-programmer<br>untuk penjanaan kod frontend/backend<br>dan enjin analitk/insight dalam aplikasi|
|Frontend Framework|React 18 + Vite / Next.js (Statc Export)|Serasi penuh dengan pelan penempatan<br>Netlify (JAMstack)|
|Reka Bentuk UI|TailwindCSS + Custom Glassmorphism Design<br>System|Lihat Bahagian 6|
|Carta & Visualisasi|Recharts / Chart.js|Carta responsif untuk semua 14 modul|
|Backend-as-a-Service|Supabase (PostgreSQL 15)|Auth, Database, Storage, Realtme, Edge<br>Functons|
|Pengesahan Pengguna|Supabase Auth (Email/Password + Magic Link +<br>SSO pilihan)|Disokong Row Level Security (RLS)|
|API Layer|Supabase Auto-generated REST/GraphQL +<br>PostgREST|Edge Functons (Deno) untuk logik custom|
|Hostng / Deployment|Netlify (Build & Deploy CI/CD)|Sambungan terus ke repositori Git|
|Kawalan Versi|Git (GitHub/GitLab)|Deploy preview automatk setap Pull<br>Request|
|Pemantauan & Log|Netlify Analytcs + Supabase Logs|Pemantauan prestasi & ralat|



#### **3.2 Rajah Seni Bina Sistem (Architecture Overview)** 

Seni bina sistem mengikut corak Jamstack tiga lapisan berikut: 

|`┌─────────────────────────────────────────────────────────┐`<br>`│   PENGGUNA (Web Browser — Desktop / Tablet / Mobile)      │`<br>`└───────────────────────────┬─────────────────────────────┘`<br>`│ HTTPS`<br>`┌───────────────────────────▼─────────────────────────────┐`<br>|
|---|
|`│  FRONTEND — React/Next.js + Tailwind (Glassmorphism UI)   │`<br>`│  Dihoskan & di-CI/CD-kan melalui NETLIFY                  │`<br>`└───────────────────────────┬─────────────────────────────┘`<br>`│ Supabase JS Client SDK (REST/Realtime)`<br>`┌───────────────────────────▼─────────────────────────────┐`<br>`│                    SUPABASE PLATFORM                      │`<br>`│  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐ │`<br>|
|`│  │  Auth     │ │ PostgreSQL│ │ Storage  │ │Edge Funcs  │ │`<br>`│  │  (JWT/RLS)│ │  Database │ │ (Fail)   │ │ (Deno/API) │ │`|
|`│  └───────────┘ └───────────┘ └──────────┘ └─────┬──────┘ │`<br>`└──────────────────────────────────────────────────┼───────┘`<br>`│ API Key`<br>`┌────────────▼────────────┐`<br>`│   z.ai GLM 5.2 API       │`<br>`│   (Insight & Chat AI)    │`<br>`└──────────────────────────┘`|



Muka Surat 5 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

#### **3.3 Aliran Data (Data Flow)** 

- Langkah 1: Pengguna log masuk melalui Supabase Auth; token JWT dijana dan disimpan pada sesi pelayar. 

- Langkah 2: Frontend memanggil API Supabase (PostgREST) untuk mendapatkan/menghantar data mengikut kebenaran RLS peranan pengguna. 

- Langkah 3: Data agregat (KPI, jumlah, peratus) dikira sama ada melalui SQL View/Materialized View di Supabase atau Edge Function. 

- Langkah 4: Modul 'AI Insight' menghantar ringkasan data (bukan data mentah sensitif) ke z.ai GLM 5.2 API melalui Edge Function bagi menjana naratif analitik automatik dalam Bahasa Malaysia. 

- Langkah 5: Sebarang kemas kini data (contoh: rekod aduan baharu) dipapar secara masa nyata pada dashboard lain menggunakan ciri Supabase Realtime (WebSocket). 

#### **3.4 Integrasi AI — z.ai GLM 5.2** 

Model GLM 5.2 daripada z.ai akan digunakan pada dua peringkat: 

- Peringkat Pembangunan (Development-time): Sebagai alat bantuan pembangunan (AI pair-programmer) untuk menjana kod komponen React, fungsi SQL, dan skrip Edge Function berdasarkan spesifikasi PRD ini. 

- Peringkat Masa Jalan (Runtime): Sebagai enjin 'AI Insight Generator' terbenam dalam dashboard — menjana ringkasan naratif automatik (contoh: "Enrolmen Sesi Jun menurun 8% berbanding sesi lepas terutama di ILP Selayang") dan menyokong ciri carian bahasa semula jadi (natural language query) ke atas data dashboard. 

Nota Keselamatan: Kunci API GLM 5.2 disimpan sebagai pembolehubah persekitaran (environment variable) di sisi pelayan (Supabase Edge Function) dan tidak sekali-kali didedahkan pada kod sisi klien (frontend). 

Muka Surat 6 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **4.  Keperluan Fungsian — Modul Dashboard** 

Bahagian ini menghuraikan 14 modul pemantauan yang membentuk teras Sistem Dashboard Pemantauan Bersepadu. Setiap modul dipetakan kepada satu atau lebih jadual Supabase, disertakan medan data, jenis visualisasi dan KPI berkaitan. 

##### **Papan Pemuka Utama (Landing Dashboard):** 

Halaman utama memaparkan 'Ringkasan Eksekutif' dalam bentuk kad KPI (KPI cards) merentasi kesemua 14 modul, dengan navigasi sisi (sidebar) beralun kaca (glass sidebar) untuk capaian pantas ke setiap modul terperinci. 

##### **FR-01  —  Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa** 

Memaparkan perbandingan sasaran pengambilan (intake) berbanding bilangan pelajar yang berjaya mendaftar (enrolled) bagi setiap sesi pembelajaran (contoh: Sesi Jun, Sesi Disember), mengikut program dan pusat latihan. 

##### **User Story:** 

- Sebagai Pengurus Akademik, saya ingin melihat peratus pencapaian enrolmen berbanding sasaran bagi setiap sesi supaya saya dapat merancang strategi pemasaran dan pengambilan. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|session_id|UUID|Pengenal unik sesi|
|session_name|TEXT|Cth: Sesi Jun 2026|
|program_id|UUID|Rujukan program|
|target_intake|INT|Sasaran pengambilan|
|actual_enrolled|INT|Bilangan mendafar sebenar|
|center_name|TEXT|Pusat lathan / kampus|
|gender_male|INT|Bilangan pelajar lelaki|
|gender_female|INT|Bilangan pelajar perempuan|



##### **Jadual Supabase:** `tbl_enrolment_fulltime` 

**Visualisasi Dashboard:** Bar chart (Sasaran vs Sebenar), Line trend merentas sesi, Peratus pencapaian (%), Peta taburan pusat latihan. 

**KPI:** _Peratus Pencapaian Enrolmen = (actual_enrolled / target_intake) × 100%_ 

##### **FR-02  —  Pemantauan Aduan Pelanggan** 

Menjejak bilangan aduan pelanggan yang diterima, kategori aduan, status penyelesaian dan tempoh masa maklum balas berbanding SLA (Service Level Agreement) yang ditetapkan. 

##### **User Story:** 

- Sebagai Pegawai Khidmat Pelanggan, saya ingin memantau tempoh maklum balas aduan secara masa nyata supaya SLA sentiasa dipatuhi. 

##### **Medan Data Utama (Key Data Fields):** 

Muka Surat 7 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|complaint_id|UUID|Pengenal unik aduan|
|date_received|DATE|Tarikh aduan diterima|
|category|TEXT|Kategori (akademik/kemudahan/kewangan)|
|status|TEXT|Baharu/Dalam Tindakan/Selesai|
|date_resolved|DATE|Tarikh diselesaikan|
|response_tme_hours|NUMERIC|Tempoh maklum balas (jam)|
|sla_target_hours|NUMERIC|Sasaran SLA (jam)|
|complainant_type|TEXT|Pelajar/Ibu bapa/Majikan|



##### **Jadual Supabase:** `tbl_customer_complaints` 

**Visualisasi Dashboard:** Trend bilangan aduan bulanan, Gauge purata masa maklum balas, Peratus pematuhan SLA, Pecahan mengikut kategori (donut). 

**KPI:** _Pematuhan SLA (%) = (Aduan diselesaikan dalam SLA / Jumlah aduan) × 100%_ 

##### **FR-03  —  Pentauliahan Program Sepenuh Masa** 

Memantau status pentauliahan (accreditation) setiap program sepenuh masa termasuk tarikh mula sah dan tarikh luput, dengan amaran automatik bagi pentauliahan yang hampir tamat tempoh. 

##### **User Story:** 

- Sebagai Pengurus Kualiti, saya ingin menerima amaran awal 90 hari sebelum pentauliahan program tamat tempoh supaya permohonan pembaharuan dapat dibuat tepat pada masanya. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|program_id|UUID|Pengenal unik program|
|program_name|TEXT|Nama program|
|accreditaton_body|TEXT|Badan pentauliahan (cth: JPK)|
|cert_no|TEXT|Nombor sijil pentauliahan|
|start_date|DATE|Tarikh mula sah|
|expiry_date|DATE|Tarikh luput|
|status|TEXT|Aktf/Akan Luput/Luput|



##### **Jadual Supabase:** `tbl_program_accreditation` 

**Visualisasi Dashboard:** Senarai status dengan badge warna (hijau/kuning/merah), Kalendar luput, Kad amaran 90/60/30 hari. 

**KPI:** _Bilangan program berstatus 'Akan Luput' dalam tempoh 90 hari_ 

##### **FR-04  —  Sijil Kemahiran Malaysia (SKM) Pengajar DV** 

Memantau bilangan dan peratus pengajar Dual Vocational (DV) yang memegang Sijil Kemahiran Malaysia Tahap 3 (SKM3), Diploma Kemahiran Malaysia (DKM) dan Diploma Lanjutan Kemahiran Malaysia (DLKM). 

##### **User Story:** 

Muka Surat 8 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

- Sebagai Ketua Jabatan, saya ingin melihat peratus pengajar bertauliah mengikut tahap sijil untuk memastikan pematuhan piawaian latihan. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|instructor_id|UUID|Pengenal unik pengajar|
|full_name|TEXT|Nama pengajar|
|department|TEXT|Jabatan/Bidang|
|cert_level|TEXT|SKM3/DKM/DLKM|
|cert_no|TEXT|Nombor sijil|
|issue_date|DATE|Tarikh dikeluarkan|
|expiry_date|DATE|Tarikh luput (jika ada)|



##### **Jadual Supabase:** `tbl_instructor_certification` 

**Visualisasi Dashboard:** Donut chart peratus mengikut tahap (SKM3/DKM/DLKM), Jadual senarai pengajar belum bersijil. 

**KPI:** _Peratus Pengajar Bersijil = (Bilangan bersijil / Jumlah pengajar DV) × 100%_ 

##### **FR-05  —  Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)** 

Menjejak jumlah jam kursus/latihan yang telah dilengkapkan oleh setiap kakitangan berbanding sasaran minimum 40 jam setahun seperti ditetapkan oleh JPA. 

##### **User Story:** 

- Sebagai Pegawai Sumber Manusia, saya ingin memantau kakitangan yang belum mencapai 40 jam latihan tahunan menjelang penghujung tahun. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|staf_id|UUID|Pengenal unik kakitangan|
|full_name|TEXT|Nama kakitangan|
|department|TEXT|Jabatan|
|year|INT|Tahun|
|hours_completed|NUMERIC|Jumlah jam selesai|
|target_hours|NUMERIC|Sasaran (default 40)|
|last_course_date|DATE|Tarikh kursus terkini|



##### **Jadual Supabase:** `tbl_staff_training` 

**Visualisasi Dashboard:** Progress bar setiap kakitangan, Peratus pematuhan jabatan, Senarai kakitangan berisiko tidak capai sasaran. 

**KPI:** _Peratus Pematuhan = (hours_completed / 40) × 100%, dikira per kakitangan dan purata jabatan_ 

Muka Surat 9 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

##### **FR-06  —  Pemantauan Perbelanjaan Bajet Mengurus (OS28000 & OS26000)** 

Memantau peruntukan dan perbelanjaan bagi Objek Am 28000 (Penyelenggaraan) dan 26000 (Bekalan & Bahan Guna Habis) mengikut bulan. 

##### **User Story:** 

- Sebagai Pegawai Kewangan, saya ingin melihat peratus perbelanjaan bajet mengurus secara bulanan untuk mengelakkan lebihan (overspend) atau bajet terbiar. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|budget_code|TEXT|Kod objek (OS28000/OS26000)|
|month|DATE|Bulan/Tahun|
|allocaton|NUMERIC|Peruntukan|
|spent|NUMERIC|Perbelanjaan|
|balance|NUMERIC|Baki|
|remarks|TEXT|Catatan|



##### **Jadual Supabase:** `tbl_budget_mengurus` 

**Visualisasi Dashboard:** Stacked bar peruntukan vs perbelanjaan, Trend bulanan, Gauge peratus penggunaan bajet. **KPI:** _Peratus Penggunaan Bajet = (spent / allocation) × 100%_ 

##### **FR-07  —  Pemantauan Perbelanjaan Bajet Pembangunan (Penyelenggaraan/Naik Taraf)** 

Memantau status kewangan projek pembangunan seperti kerja penyelenggaraan dan naik taraf infrastruktur, termasuk peratus siap projek. 

##### **User Story:** 

- Sebagai Pengurus Fasiliti, saya ingin memantau kemajuan kewangan dan fizikal projek naik taraf berbanding jadual yang dirancang. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|project_id|UUID|Pengenal projek|
|project_name|TEXT|Nama projek|
|category|TEXT|Penyelenggaraan/Naik Taraf|
|allocaton|NUMERIC|Peruntukan projek|
|spent|NUMERIC|Perbelanjaan setakat ini|
|completon_pct|NUMERIC|Peratus siap fzikal|
|status|TEXT|Belum Mula/Dalam Pelaksanaan/Siap|
|target_date|DATE|Tarikh siap dijadualkan|



##### **Jadual Supabase:** `tbl_budget_pembangunan` 

**Visualisasi Dashboard:** Senarai kad projek dengan progress bar berkembar (kewangan & fizikal), carta Gantt ringkas. 

Muka Surat 10 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

##### **KPI:** _Indeks Prestasi Kos = spent / (allocation × completion_pct)_ 

##### **FR-08  —  Pemantauan Verifikasi Stok** 

Menjejak proses semakan (verifikasi) stok fizikal berbanding rekod sistem, termasuk percanggahan (variance) yang dikesan. 

##### **User Story:** 

- Sebagai Pegawai Stor, saya ingin melihat senarai item dengan percanggahan kuantiti selepas semakan stok tahunan/suku tahunan. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|item_code|TEXT|Kod item|
|item_name|TEXT|Nama item|
|system_qty|INT|Kuantt mengikut sistem|
|physical_qty|INT|Kuantt fzikal disemak|
|variance|INT|Percanggahan (auto-kira)|
|verifed_by|TEXT|Nama pegawai penyemak|
|verify_date|DATE|Tarikh semakan|
|status|TEXT|Sepadan/Percanggahan|



##### **Jadual Supabase:** `tbl_stock_verification` 

**Visualisasi Dashboard:** Jadual percanggahan (highlight merah), Peratus item disahkan, Trend percanggahan mengikut kategori stok. 

**KPI:** _Peratus Ketepatan Stok = (Item sepadan / Jumlah item disemak) × 100%_ 

##### **FR-09  —  Enrolmen Peserta Kursus Jangka Pendek** 

Memantau bilangan pendaftaran peserta bagi kursus jangka pendek (short course) termasuk kapasiti, jenis peserta (awam/korporat) dan hasil pendapatan. 

##### **User Story:** 

- Sebagai Pegawai Latihan Jangka Pendek, saya ingin melihat kursus paling laris dan kadar pengisian kapasiti bagi setiap kursus yang ditawarkan. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|course_id|UUID|Pengenal kursus|
|course_name|TEXT|Nama kursus|
|session_date|DATE|Tarikh kursus|
|capacity|INT|Kapasit maksimum|
|partcipant_count|INT|Bilangan peserta didafar|
|category|TEXT|Awam/Korporat|



Muka Surat 11 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|revenue|NUMERIC|Hasil kutpan|



##### **Jadual Supabase:** `tbl_short_course_enrolment` 

**Visualisasi Dashboard:** Ranking kursus terlaris, Peratus pengisian kapasiti, Trend hasil bulanan. **KPI:** _Kadar Pengisian = (participant_count / capacity) × 100%_ 

##### **FR-10  —  Senarai Pelajar Sepenuh Masa Bergraduat** 

Memaparkan senarai dan statistik pelajar sepenuh masa yang bergraduat mengikut sesi pembelajaran, termasuk status kebolehpasaran (employability). 

##### **User Story:** 

- Sebagai Pengurus Akademik, saya ingin melihat bilangan graduan setiap sesi dan status pekerjaan mereka selepas tamat pengajian. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|student_id|UUID|Pengenal pelajar|
|full_name|TEXT|Nama pelajar|
|program_id|UUID|Rujukan program|
|session_name|TEXT|Sesi pengajian|
|graduaton_date|DATE|Tarikh bergraduat|
|fnal_grade|TEXT|Gred/CGPA akhir|
|employment_status|TEXT|Bekerja/Belum Bekerja/Melanjut Pelajaran|



##### **Jadual Supabase:** `tbl_graduates` 

**Visualisasi Dashboard:** Trend bilangan graduan per sesi, Peratus kebolehpasaran, Jadual senarai boleh ditapis mengikut program. 

**KPI:** _Peratus Kebolehpasaran = (Bekerja dalam 6 bulan / Jumlah graduan) × 100%_ 

##### **FR-11  —  Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)** 

Memantau kedudukan kewangan Akaun Amanah dengan perbandingan pendapatan (income) dan perbelanjaan (expense) serta baki terkumpul. 

##### **User Story:** 

- Sebagai Pegawai Kewangan Kanan, saya ingin melihat aliran tunai Akaun Amanah secara bulanan untuk memastikan kelestarian kewangan. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|transacton_id|UUID|Pengenal transaksi|
|transacton_type|TEXT|Income/Expense|
|category|TEXT|Kategori transaksi|



Muka Surat 12 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|amount|NUMERIC|Jumlah (RM)|
|transacton_date|DATE|Tarikh transaksi|
|running_balance|NUMERIC|Baki terkumpul|



##### **Jadual Supabase:** `tbl_trust_account` 

**Visualisasi Dashboard:** Carta perbandingan Pendapatan vs Perbelanjaan (bar berkembar), Trend baki (line chart). 

**KPI:** _Nisbah Kewangan = Pendapatan / Perbelanjaan (sasaran > 1.0)_ 

##### **FR-12  —  Pemantauan Akaun Mengurus (Peratus Perbelanjaan)** 

Memantau peratus perbelanjaan keseluruhan Akaun Mengurus berbanding peruntukan tahunan bagi setiap kod akaun. 

##### **User Story:** 

- Sebagai Pengurus Kewangan, saya ingin melihat gambaran keseluruhan peratus perbelanjaan semua kod akaun mengurus dalam satu paparan ringkas. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|account_code|TEXT|Kod akaun mengurus|
|account_name|TEXT|Nama akaun|
|allocaton|NUMERIC|Peruntukan tahunan|
|spent|NUMERIC|Perbelanjaan terkini|
|month|DATE|Bulan semasa|



##### **Jadual Supabase:** `tbl_mengurus_account` 

**Visualisasi Dashboard:** Gauge/speedometer peratus perbelanjaan per kod akaun, Jadual ringkasan berwarna (hijau <70%, kuning 70-90%, merah >90%). 

**KPI:** _Peratus Perbelanjaan = (spent / allocation) × 100%_ 

##### **FR-13  —  Pemantauan Aset (Semakan Aset)** 

Menjejak status semakan aset alih kerajaan termasuk lokasi, keadaan fizikal dan jadual semakan berkala. 

##### **User Story:** 

- Sebagai Pegawai Aset, saya ingin melihat senarai aset yang tertunggak semakan berkala supaya tindakan pematuhan dapat diambil. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|asset_code|TEXT|Kod pendafaran aset (KEW.PA)|
|asset_name|TEXT|Nama aset|
|locaton|TEXT|Lokasi/Bilik|



Muka Surat 13 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|conditon|TEXT|Baik/Rosak/Perlu Baiki|
|last_check_date|DATE|Tarikh semakan terakhir|
|next_check_date|DATE|Tarikh semakan seterusnya|
|status|TEXT|Terkini/Tertunggak|



##### **Jadual Supabase:** `tbl_asset_monitoring` 

**Visualisasi Dashboard:** Peta taburan aset mengikut lokasi, Senarai aset tertunggak semakan, Pecahan keadaan aset (pie chart). 

**KPI:** _Peratus Pematuhan Semakan = (Aset disemak tepat masa / Jumlah aset) × 100%_ 

##### **FR-14  —  Pemantauan Bilangan Komputer** 

Memantau inventori komputer mengikut makmal/lokasi, status fungsi dan umur peralatan bagi tujuan perancangan penggantian. 

##### **User Story:** 

- Sebagai Pegawai ICT, saya ingin melihat bilangan komputer rosak/perlu diganti mengikut makmal untuk merancang bajet penggantian. 

##### **Medan Data Utama (Key Data Fields):** 

|**Medan**|**Jenis Data**|**Keterangan**|
|---|---|---|
|computer_id|UUID|Pengenal komputer|
|asset_tag|TEXT|Nombor tag aset|
|locaton|TEXT|Makmal/Lokasi|
|brand_model|TEXT|Jenama & Model|
|purchase_year|INT|Tahun pembelian|
|status|TEXT|Berfungsi/Rosak/Penyelenggaraan|
|os_version|TEXT|Versi sistem operasi|



##### **Jadual Supabase:** `tbl_computer_inventory` 

**Visualisasi Dashboard:** Bilangan mengikut status (kad ringkasan), Pecahan mengikut makmal, Senarai komputer melebihi 5 tahun (jadual penggantian). 

**KPI:** _Peratus Komputer Berfungsi = (Berfungsi / Jumlah) × 100%_ 

Muka Surat 14 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **5.  Reka Bentuk Pangkalan Data (Supabase)** 

#### **5.1 Gambaran Keseluruhan Skema** 

Pangkalan data direka menggunakan PostgreSQL (Supabase) dengan 14 jadual teras (satu bagi setiap modul), disokong oleh jadual rujukan (lookup) seperti tbl_program, tbl_staff dan tbl_session. Setiap jadual menggunakan uuid sebagai kunci primer, dilengkapi medan created_at/updated_at untuk audit trail. 

|**Jadual**|**Modul Berkaitan**|
|---|---|
|tbl_enrolment_fulltme|FR-01 — Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa|
|tbl_customer_complaints|FR-02 — Pemantauan Aduan Pelanggan|
|tbl_program_accreditaton|FR-03 — Pentauliahan Program Sepenuh Masa|
|tbl_instructor_certfcaton|FR-04 — Sijil Kemahiran Malaysia (SKM) Pengajar DV|
|tbl_staf_training|FR-05 — Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)|
|tbl_budget_mengurus|FR-06 — Pemantauan Perbelanjaan Bajet Mengurus (OS28000 & OS26000)|
|tbl_budget_pembangunan|FR-07 — Pemantauan Perbelanjaan Bajet Pembangunan (Penyelenggaraan/Naik<br>Taraf)|
|tbl_stock_verifcaton|FR-08 — Pemantauan Verifkasi Stok|
|tbl_short_course_enrolment|FR-09 — Enrolmen Peserta Kursus Jangka Pendek|
|tbl_graduates|FR-10 — Senarai Pelajar Sepenuh Masa Bergraduat|
|tbl_trust_account|FR-11 — Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)|
|tbl_mengurus_account|FR-12 — Pemantauan Akaun Mengurus (Peratus Perbelanjaan)|
|tbl_asset_monitoring|FR-13 — Pemantauan Aset (Semakan Aset)|
|tbl_computer_inventory|FR-14 — Pemantauan Bilangan Komputer|



#### **5.2 Dasar Keselamatan Row Level Security (RLS)** 

- RLS diaktifkan (ENABLE ROW LEVEL SECURITY) pada SEMUA jadual tanpa pengecualian. 

- Polisi 'SELECT' asas: pengguna hanya boleh melihat data mengikut peranan yang ditetapkan dalam jadual tbl_user_roles. 

- Polisi 'INSERT/UPDATE': terhad kepada peranan Pegawai Input Data dan Pengurus Unit bagi modul berkaitan sahaja. 

- Super Admin dikecualikan daripada sekatan RLS melalui semakan custom claim 'is_admin' pada JWT. 

#### **5.3 Strategi Data Dummy (Seed Data)** 

Bagi memenuhi keperluan demonstrasi dan pengujian sistem sebelum integrasi data sebenar, satu skrip 'seed.sql' akan disediakan untuk mengisi kesemua 14 jadual dengan data pura-pura (dummy) yang realistik — merangkumi sekurang-kurangnya 3 sesi pembelajaran, 20 rekod pelajar, 10 rekod aduan, 15 rekod aset dan seumpamanya — bagi membolehkan carta dan KPI dashboard dipaparkan dengan bermakna sejak hari pertama penempatan (deployment). 

Contoh skrip SQL bagi penciptaan jadual dan data dummy disertakan dalam Lampiran B. Skrip penuh 14 jadual akan disediakan sebagai fail berasingan seed_dummy_data.sql semasa fasa pembangunan. 

Muka Surat 15 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

#### **5.4 Fungsi & View Agregat** 

View SQL disyorkan bagi mempercepatkan pengiraan KPI dashboard tanpa membebankan frontend: 

```
create or replace view public.vw_enrolment_summary as
select session_name,
       sum(target_intake)   as total_target,
       sum(actual_enrolled) as total_enrolled,
       round(100.0 * sum(actual_enrolled) / nullif(sum(target_intake),0), 1) as
pct_achieved
from public.tbl_enrolment_fulltime
group by session_name
order by session_name;
```

Muka Surat 16 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **6.  Reka Bentuk UI/UX — Glassmorphism** 

#### **6.1 Prinsip Reka Bentuk** 

- Kesan kaca legap separa (frosted-glass): latar belakang blur (backdrop-filter: blur(16-24px)) dengan kelegapan (opacity) 60-75% pada kad dan panel. 

- Sempadan (border) halus 1px berwarna putih legap rendah (rgba(255,255,255,0.18)) untuk memberi ilusi tepi kaca. 

- Bayang lembut (soft shadow) berlapis bagi kedalaman visual tanpa kesan berat. 

- Latar belakang gradient dinamik (navy-ke-teal) di sebalik lapisan kaca bagi kontras optimum dan keterbacaan teks. 

- Reka bentuk responsif sepenuhnya (mobile-first) — susun atur kad menyesuaikan diri dari 4 lajur (desktop) kepada 1 lajur (mobile). 

- Mod Terang & Gelap (Light/Dark Mode) disokong sepenuhnya dengan pengekalan kesan kaca pada kedua-dua mod. 

#### **6.2 Palet Warna & Tipografi** 

|**Elemen**|**Nilai**|**Kegunaan**|
|---|---|---|
|Warna Primer|#0B2545 (Navy Deep)|Latar utama, teks tajuk|
|Warna Sekunder|#1B4B91 (Royal Blue)|Aksen, butang utama|
|Warna Aksen|#0E8388 (Teal)|Highlight, status positf|
|Warna Amaran|#C79A3B (Gold/Amber)|Status 'Akan Luput', amaran sederhana|
|Warna Kritkal|#D64545 (Red)|Status 'Luput'/'Kritkal'|
|Kaca (Glass Fill)|rgba(255,255,255,0.10–0.20)|Latar kad & panel|
|Fon Tajuk|Poppins / Inter — Semi Bold|Tajuk modul & KPI|
|Fon Kandungan|Inter / Calibri — Regular|Teks badan & jadual|



#### **6.3 Komponen Utama Antara Muka** 

- Kad KPI Kaca (Glass KPI Card): memaparkan satu metrik utama, ikon, nilai, dan penunjuk trend (naik/turun %). 

- Panel Carta Kaca: bekas carta (Recharts) dengan latar kaca dan legend responsif. 

- Bar Navigasi Sisi Terapung (Floating Glass Sidebar): senarai 14 modul dengan ikon, boleh kuncup (collapsible). 

- Jadual Data Responsif: dengan penapis (filter), carian, dan eksport CSV/PDF bagi setiap modul. 

- Komponen Amaran (Alert Badge): badge berwarna dinamik mengikut status ambang (threshold) — Hijau/Kuning/Merah. 

- Panel 'AI Insight' (GLM 5.2): kad kaca khas memaparkan ringkasan naratif automatik dan ruang input soalan bahasa semula jadi. 

#### **6.4 Susun Atur Halaman Utama (Landing Layout)** 

```
 ┌──────────┬──────────────────────────────────────────────┐
 │  LOGO    │   Tajuk: Dashboard Pemantauan Bersepadu JTM   │
 │  JTM     │                              [Profil] [Notis] │
 ├──────────┼──────────────────────────────────────────────┤
```

Muka Surat 17 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

|`│ Sidebar  │  ┌──── AI Insight Panel (Glass) ────────────┐ │`<br>`│ (Glass)  │  │ "Enrolmen sesi ini meningkat 6%..."       │ │`<br>`│          │  └───────────────────────────────────────────┘ │`|
|---|
|<br>`│ • FR-01  │  ┌──────┐┌──────┐┌──────┐┌──────┐               │`<br>`│ • FR-02  │  │KPI 1 ││KPI 2 ││KPI 3 ││KPI 4 │  (Glass Cards)│`<br>`│ • FR-03  │  └──────┘└──────┘└──────┘└──────┘               │`<br>|
|`│ ...      │  ┌────────────────┐  ┌────────────────┐        │`<br>`│ • FR-14  │  │  Carta Trend   │  │  Carta Status  │        │`<br>`│          │  └────────────────┘  └────────────────┘        │`<br>`└──────────┴──────────────────────────────────────────────┘`|



Muka Surat 18 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **7.  Keperluan Bukan Fungsian** 

|**Kategori**|**Keperluan**|
|---|---|
|Keselamatan|Pengesahan JWT melalui Supabase Auth, RLS pada semua jadual, penyulitan HTTPS/TLS<br>1.3 end-to-end, kunci API GLM 5.2 disimpan di Edge Functon sahaja.|
|Prestasi|Masa muat halaman < 2.5 saat (First Contentul Paint) pada rangkaian 4G; carta dimuat<br>secara lazy-load.|
|Kebolehskalaan|Seni bina serverless (Supabase + Netlify Functons) membolehkan penskalaan automatk<br>mengikut beban.|
|Ketersediaan|Sasaran waktu operasi (uptme) 99.5% menerusi SLA Netlify & Supabase managed<br>hostng.|
|Kebolehcapaian<br>(Accessibility)|Pematuhan asas WCAG 2.1 AA — kontras warna mencukupi walaupun pada kesan kaca<br>legap.|
|Pematuhan Data|Selari dengan Akta Perlindungan Data Peribadi (PDPA) 2010 bagi pengendalian data<br>pelajar & kakitangan.|
|Kebolehselenggaraan|Kod sumber diselenggara mengikut struktur modular (component-based) dengan<br>dokumentasi README bagi setap modul.|
|Log & Audit Trail|Setap transaksi CUD (Create/Update/Delete) direkod dalam jadual tbl_audit_log dengan<br>id pengguna & cap masa.|



Muka Surat 19 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **8.  Pelan Penempatan (Deployment Plan)** 

#### **8.1 Persekitaran Supabase** 

- Cipta projek Supabase baharu (Region: Singapore — ap-southeast-1 untuk kependaman rendah dari Malaysia). 

- Jalankan skrip migrasi schema.sql untuk mencipta 14 jadual teras + jadual rujukan. 

- Jalankan skrip seed_dummy_data.sql untuk mengisi data dummy awal. 

- Konfigurasikan dasar RLS bagi setiap jadual mengikut Bahagian 5.2. 

- Aktifkan Supabase Auth (Email/Password) dan konfigurasikan templat e-mel dalam Bahasa Malaysia. 

- Cipta Edge Function 'ai-insight' untuk pengendalian panggilan API z.ai GLM 5.2 secara selamat di sisi pelayan. 

#### **8.2 Persekitaran Netlify** 

- Sambungkan repositori Git (GitHub) projek frontend ke Netlify melalui 'Import from Git'. 

- Konfigurasikan Build Command: npm run build; Publish Directory: dist/ atau .next/ (mengikut framework dipilih). 

- Tetapkan pembolehubah persekitaran (Environment Variables) di Netlify: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (kunci awam sahaja). 

- Aktifkan 'Deploy Previews' automatik bagi setiap Pull Request untuk semakan sebelum penggabungan (merge) ke cawangan utama (main). 

- Konfigurasikan domain kustom (contoh: dashboard.jtm.gov.my) dengan sijil SSL percuma Netlify (Let's Encrypt). 

- Aktifkan Netlify Forms/Functions sekiranya diperlukan bagi ciri tambahan seperti notifikasi e-mel. 

#### **8.3 Aliran Kerja CI/CD** 

```
  Developer Push → GitHub (branch: feature/*)
        │
        ▼
  Netlify Auto-Build (npm install → npm run build)
        │
        ▼
  Deploy Preview URL dijana → Semakan QA/UAT
        │  (selepas kelulusan)
        ▼
  Merge ke 'main' → Netlify Production Deploy
        │
        ▼
  Sistem Langsung (Live) di domain pengeluaran
```

Muka Surat 20 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **9.  Pelan Pengujian (Testing Plan)** 

|**Jenis Ujian**|**Skop**|**Alat/Kaedah**|
|---|---|---|
|Ujian Unit|Fungsi pengiraan KPI & komponen React individu|Vitest / Jest|
|Ujian Integrasi|Interaksi frontend ↔ Supabase API|Playwright / Postman|
|Ujian RLS Keselamatan|Sahkan setap peranan hanya capai data<br>dibenarkan|Manual + Automated Test Script|
|Ujian Responsif UI|Kesahihan kesan Glassmorphism merentasi<br>perant|BrowserStack / Chrome DevTools|
|Ujian Prestasi|Beban serentak & masa tndak balas dashboard|Lighthouse / k6|
|Ujian Penerimaan<br>Pengguna (UAT)|Pengesahan oleh wakil setap Bahagian<br>(Akademik, Kewangan, Aset, ICT)|Sesi UAT berstruktur|



Muka Surat 21 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **10.  Garis Masa Projek & Pencapaian Utama** 

|**Fasa**|**Aktvit Utama**|**Tempoh Anggaran**|
|---|---|---|
|Fasa 0|Persediaan projek: setup Supabase, Netlify, repositori Git, kelulusan PRD|Minggu 1|
|Fasa 1|Reka bentuk skema pangkalan data & UI/UX Glassmorphism (wireframe &<br>prototaip)|Minggu 2–3|
|Fasa 2|Pembangunan 14 modul dashboard (menggunakan z.ai GLM 5.2 sebagai<br>enjin bantuan pembangunan)|Minggu 4–8|
|Fasa 3|Integrasi data dummy, panel AI Insight, dan RLS keselamatan|Minggu 9–10|
|Fasa 4|Ujian QA menyeluruh (unit, integrasi, keselamatan, prestasi)|Minggu 11|
|Fasa 5|UAT bersama pemegang taruh & pembetulan (bug-fxing)|Minggu 12|
|Fasa 6|Penempatan produksi ke Netlify & serah terima sistem|Minggu 13|



Muka Surat 22 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **11.  Risiko & Strategi Mitigasi** 

|**Risiko**|**Impak**|**Mitgasi**|
|---|---|---|
|Kelewatan pembekalan data<br>sebenar daripada Bahagian<br>berkaitan|Sederhana|Gunakan data dummy realistk semasa fasa pembangunan<br>& UAT; integrasi data sebenar dijadualkan berasingan|
|Had kuota/kos panggilan API z.ai<br>GLM 5.2|Rendah–Sederhana|Cache respons AI Insight (contoh: kemas kini setap 6 jam,<br>bukan setap muat halaman) untuk kawal kos|
|Kebocoran data akibat konfgurasi<br>RLS tdak lengkap|Tinggi|Semakan keselamatan (security review) wajib sebelum<br>setap deployment produksi|
|Prestasi terjejas pada perant<br>mudah alih akibat kesan blur<br>Glassmorphism|Rendah|Optmum backdrop-flter & sediakan fallback solid-color<br>bagi perant prestasi rendah|
|Pertndihan skop dengan sistem<br>legasi sedia ada|Sederhana|Pemetaan skop jelas dalam Bahagian 1.3; libatkan pemilik<br>sistem legasi awal projek|



Muka Surat 23 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

### **12.  Lampiran** 

#### **Lampiran A — Rumusan 14 Modul Dashboard** 

|**Kod**|**Modul**|
|---|---|
|FR-01|Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa|
|FR-02|Pemantauan Aduan Pelanggan|
|FR-03|Pentauliahan Program Sepenuh Masa|
|FR-04|Sijil Kemahiran Malaysia (SKM) Pengajar DV|
|FR-05|Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)|
|FR-06|Pemantauan Perbelanjaan Bajet Mengurus (OS28000 & OS26000)|
|FR-07|Pemantauan Perbelanjaan Bajet Pembangunan (Penyelenggaraan/Naik Taraf)|
|FR-08|Pemantauan Verifkasi Stok|
|FR-09|Enrolmen Peserta Kursus Jangka Pendek|
|FR-10|Senarai Pelajar Sepenuh Masa Bergraduat|
|FR-11|Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)|
|FR-12|Pemantauan Akaun Mengurus (Peratus Perbelanjaan)|
|FR-13|Pemantauan Aset (Semakan Aset)|
|FR-14|Pemantauan Bilangan Komputer|



#### **Lampiran B — Contoh Skrip SQL (Skema & Data Dummy)** 

Contoh berikut menggambarkan corak (pattern) yang akan digunakan bagi kesemua 14 jadual. Skrip penuh akan disediakan dalam fail berasingan semasa fasa pembangunan. 

```
-- ============================================================
-- DUMMY / SEED DATA — Sistem Dashboard Pemantauan Bersepadu
-- Skema: public | Platform: Supabase (PostgreSQL 15)
```

```
-- ============================================================
```

```
create table public.tbl_enrolment_fulltime (
  id uuid primary key default gen_random_uuid(),
  session_name text not null,
  program_id uuid references public.tbl_program(id),
  target_intake int not null default 0,
  actual_enrolled int not null default 0,
  center_name text,
  gender_male int default 0,
  gender_female int default 0,
  created_at timestamptz default now()
);
```

```
insert into public.tbl_enrolment_fulltime
  (session_name, target_intake, actual_enrolled, center_name, gender_male,
gender_female)
values
  ('Sesi Jun 2026', 120, 108, 'ILP Kuala Lumpur', 70, 38),
  ('Sesi Disember 2025', 100, 96, 'ILP Kuala Lumpur', 60, 36),
  ('Sesi Jun 2025', 110, 82, 'ILP Selayang', 55, 27);
```

Muka Surat 24 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

```
create table public.tbl_customer_complaints (
  id uuid primary key default gen_random_uuid(),
  date_received date not null,
  category text not null,
  status text not null default 'Baharu',
  date_resolved date,
  response_time_hours numeric,
  sla_target_hours numeric default 72,
  complainant_type text,
  created_at timestamptz default now()
);
insert into public.tbl_customer_complaints
  (date_received, category, status, date_resolved, response_time_hours,
complainant_type)
values
  ('2026-06-02','Akademik','Selesai','2026-06-04', 48, 'Pelajar'),
  ('2026-06-10','Kemudahan','Dalam Tindakan', null, null, 'Ibu Bapa'),
  ('2026-06-18','Kewangan','Selesai','2026-06-19', 24, 'Pelajar');
```

```
create table public.tbl_instructor_certification (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  department text,
  cert_level text check (cert_level in ('SKM3','DKM','DLKM')),
  cert_no text,
  issue_date date,
  expiry_date date,
  created_at timestamptz default now()
);
insert into public.tbl_instructor_certification
  (full_name, department, cert_level, cert_no, issue_date)
values
  ('Ahmad Bin Zulkifli','Teknologi Automotif','DKM','DKM-2023-0451','2023-03-14'),
  ('Nurul Aini Binti Hassan','Teknologi Elektrik','SKM3','SKM3-2022-1187','2022-08-
02'),
  ('Rajesh a/l Kumar','Teknologi Maklumat','DLKM','DLKM-2024-0092','2024-01-20');
```

```
create table public.tbl_asset_monitoring (
  id uuid primary key default gen_random_uuid(),
  asset_code text unique not null,
  asset_name text not null,
  location text,
  condition text check (condition in ('Baik','Perlu Baiki','Rosak')),
  last_check_date date,
  next_check_date date,
  created_at timestamptz default now()
);
insert into public.tbl_asset_monitoring
  (asset_code, asset_name, location, condition, last_check_date, next_check_date)
values
  ('KEW.PA-0231','Projektor LCD','Bilik Kuliah A1','Baik','2026-01-10','2026-07-10'),
  ('KEW.PA-0455','Mesin Kimpalan CNC','Makmal Kimpalan 2','Perlu Baiki','2025-12-
05','2026-06-05'),
```

Muka Surat 25 daripada 28 

_PRD — Sistem Dashboard Pemantauan Bersepadu JTM_ 

```
  ('KEW.PA-0678','Penghawa Dingin 2HP','Pejabat Pentadbiran','Baik','2026-02-
18','2026-08-18');
```

#### **Lampiran C — Senarai Singkatan** 

Rujuk Bahagian 1.4 — Definisi & Akronim. 

_— Tamat Dokumen PRD —_ 

Muka Surat 26 daripada 28 

