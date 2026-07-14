// Seed script — Sistem Dashboard Pemantauan Bersepadu JTM
// Populates all 14 module tables (tbl_*) with realistic dummy data
// matching the PRD's "Strategi Data Dummy" (Section 5.3).
//
// Run: bun run prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const centers = [
  "ILP Kuala Lumpur",
  "ILP Selayang",
  "IKM Kuala Selangor",
  "ILP Tapah",
  "IKM Ledang",
  "ILP Pagoh",
  "IKM Jasin",
  "ILP Kota Bharu",
];

const programs = [
  { code: "AUT-001", name: "Teknologi Automotif", field: "Automotif", level: "SKM3", duration: 24 },
  { code: "ELE-002", name: "Teknologi Elektrik", field: "Elektrik", level: "SKM3", duration: 24 },
  { code: "WLD-003", name: "Kimpalan Arka Logam", field: "Pembuatan", level: "SKM3", duration: 18 },
  { code: "IT-004", name: "Teknologi Maklumat & Sokongan", field: "ICT", level: "DKM", duration: 30 },
  { code: "MEC-005", name: "Pemesinan CNC", field: "Pembuatan", level: "DKM", duration: 30 },
  { code: "AC-006", name: "Penyaman Udara & Pemulaan", field: "Elektrik", level: "SKM3", duration: 18 },
  { code: "CIV-007", name: "Kejuruteraan Awam", field: "Pembinaan", level: "DKM", duration: 30 },
  { code: "FNB-008", name: "Pengurusan Katering", field: "Hospitaliti", level: "SKM3", duration: 18 },
  { code: "BTS-009", name: "Pemasangan Bangunan", field: "Pembinaan", level: "DLKM", duration: 36 },
  { code: "FRZ-010", name: "Teknologi Penyejuk Beku", field: "Elektrik", level: "SKM3", duration: 18 },
];

const departments = [
  "Jabatan Automotif",
  "Jabatan Elektrik",
  "Jabatan Pembuatan",
  "Jabatan ICT",
  "Jabatan Pembinaan",
  "Jabatan Hospitaliti",
  "Pentadbiran",
  "Kewangan",
];

const malayNames = [
  "Ahmad Bin Zulkifli",
  "Nurul Aini Binti Hassan",
  "Siti Khadijah Binti Omar",
  "Muhammad Faiz Bin Rahman",
  "Fatimah Binti Yusof",
  "Rajesh a/l Kumar",
  "Lim Wei Jie",
  "Aisyah Binti Abdullah",
  "Mohd Hafiz Bin Ibrahim",
  "Priya a/p Subramaniam",
  "Tan Chee Keong",
  "Zulkifli Bin Mohamad",
  "Nur Hidayah Binti Aziz",
  "Chong Wei Ming",
  "Kumaravel a/l Samy",
  "Rosnah Binti Mohamed",
  "Hafizul Bin Che Hasan",
  "Wong Sze Fei",
  "Farah Nadia Binti Hashim",
  "Suresh a/l Maniam",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000);
}
function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("🗑  Cleaning existing data...");
  await db.tblAuditLog.deleteMany();
  await db.tblComputerInventory.deleteMany();
  await db.tblAssetMonitoring.deleteMany();
  await db.tblMengurusAccount.deleteMany()
  await db.tblTrustAccount.deleteMany()
  await db.tblGraduate.deleteMany()
  await db.tblShortCourseEnrolment.deleteMany()
  await db.tblStockVerification.deleteMany()
  await db.tblBudgetPembangunan.deleteMany()
  await db.tblBudgetMengurus.deleteMany()
  await db.tblStaffTraining.deleteMany()
  await db.tblInstructorCertification.deleteMany()
  await db.tblProgramAccreditation.deleteMany()
  await db.tblCustomerComplaint.deleteMany()
  await db.tblEnrolmentFulltime.deleteMany()
  await db.tblTrainingCenter.deleteMany()
  await db.tblSession.deleteMany()
  await db.tblStaff.deleteMany()
  await db.tblProgram.deleteMany()

  // -------- Lookup: Programs --------
  console.log("🌱 Seeding lookup: programs...");
  const programIds: string[] = [];
  for (const p of programs) {
    const rec = await db.tblProgram.create({
      data: {
        programCode: p.code,
        programName: p.name,
        field: p.field,
        level: p.level,
        durationMnth: p.duration,
      },
    });
    programIds.push(rec.id);
  }

  // -------- Lookup: Sessions --------
  console.log("🌱 Seeding lookup: sessions...");
  const sessionNames = [
    "Sesi Disember 2024",
    "Sesi Jun 2025",
    "Sesi Disember 2025",
    "Sesi Jun 2026",
  ];
  const sessionIds: Record<string, string> = {};
  for (const s of sessionNames) {
    const rec = await db.tblSession.create({ data: { sessionName: s } });
    sessionIds[s] = rec.id;
  }

  // -------- Lookup: Staff --------
  console.log("🌱 Seeding lookup: staff...");
  const staffIds: string[] = [];
  for (let i = 0; i < 20; i++) {
    const rec = await db.tblStaff.create({
      data: {
        staffNo: `JTM-${String(1001 + i)}`,
        fullName: malayNames[i],
        department: pick(departments),
        position: pick(["Pegawai", "Penolong Pegawai", "Pengajar", "Pegawai Sokongan"]),
        email: `staff${i + 1}@jtm.gov.my`,
      },
    });
    staffIds.push(rec.id);
  }

  // -------- FR-01: Enrolment Full-time --------
  console.log("🌱 Seeding FR-01: enrolment full-time...");
  for (const s of sessionNames) {
    for (let i = 0; i < 8; i++) {
      const target = rand(80, 140);
      const enrolled = Math.round(target * (0.65 + Math.random() * 0.4));
      const male = Math.round(enrolled * (0.55 + Math.random() * 0.15));
      await db.tblEnrolmentFulltime.create({
        data: {
          sessionId: sessionIds[s],
          sessionName: s,
          programId: pick(programIds),
          targetIntake: target,
          actualEnrolled: enrolled,
          centerName: pick(centers),
          genderMale: male,
          genderFemale: enrolled - male,
        },
      });
    }
  }

  // -------- FR-02: Customer Complaints --------
  console.log("🌱 Seeding FR-02: customer complaints...");
  const complaintCats = ["Akademik", "Kemudahan", "Kewangan", "ICT"];
  const complaintStatus = ["Selesai", "Dalam Tindakan", "Baharu"];
  const complaintTypes = ["Pelajar", "Ibu Bapa", "Majikan", "Awam"];
  for (let i = 0; i < 28; i++) {
    const received = daysFromNow(-rand(1, 90));
    const status = pick(complaintStatus);
    const resolved = status === "Selesai" ? daysFromNow(-rand(0, 20)) : null;
    const respHours =
      status === "Selesai" ? rand(6, 96) : status === "Dalam Tindakan" ? rand(24, 120) : null;
    await db.tblCustomerComplaint.create({
      data: {
        complaintRef: `ADN-${2026000 + i}`,
        dateReceived: received,
        category: pick(complaintCats),
        status,
        dateResolved: resolved,
        responseTimeHours: respHours,
        slaTargetHours: 72,
        complainantType: pick(complaintTypes),
        description: "Aduan diterima melalui portal Khidmat Pelanggan JTM.",
      },
    });
  }

  // -------- FR-03: Program Accreditation --------
  console.log("🌱 Seeding FR-03: program accreditation...");
  for (let i = 0; i < programIds.length; i++) {
    const daysToExpiry = pick([-400, -30, 20, 45, 80, 120, 250, 600]);
    const expiry = daysFromNow(daysToExpiry);
    let status = "Aktif";
    if (daysToExpiry < 0) status = "Luput";
    else if (daysToExpiry <= 90) status = "Akan Luput";
    const p = programs[i];
    await db.tblProgramAccreditation.create({
      data: {
        programId: programIds[i],
        programName: p.name,
        accreditationBody: pick(["JPK", "MQA", "DSD"]),
        certNo: `ACC-${2022 + (i % 4)}-${String(1000 + i)}`,
        startDate: daysFromNow(-rand(500, 1500)),
        expiryDate: expiry,
        status,
      },
    });
  }

  // -------- FR-04: Instructor Certification --------
  console.log("🌱 Seeding FR-04: instructor certification...");
  const certLevels = ["SKM3", "DKM", "DLKM"];
  for (let i = 0; i < 25; i++) {
    const level = i < 14 ? pick(certLevels) : null; // some instructors uncertified
    await db.tblInstructorCertification.create({
      data: {
        fullName: pick(malayNames) + (i > 9 ? ` ${i}` : ""),
        department: pick(departments),
        certLevel: level,
        certNo: level ? `${level}-${2020 + rand(0, 5)}-${String(1000 + i)}` : null,
        issueDate: level ? daysFromNow(-rand(200, 1500)) : null,
        expiryDate: level && Math.random() > 0.7 ? daysFromNow(rand(10, 200)) : null,
      },
    });
  }

  // -------- FR-05: Staff Training (40 hours/year) --------
  console.log("🌱 Seeding FR-05: staff training...");
  for (let i = 0; i < staffIds.length; i++) {
    const staff = await db.tblStaff.findUnique({ where: { id: staffIds[i] } });
    if (!staff) continue;
    for (const yr of [2024, 2025, 2026]) {
      const hours = yr === 2026 ? rand(8, 46) : rand(20, 50);
      await db.tblStaffTraining.create({
        data: {
          staffId: staffIds[i],
          fullName: staff.fullName,
          department: staff.department || "Pentadbiran",
          year: yr,
          hoursCompleted: hours,
          targetHours: 40,
          lastCourseDate: daysFromNow(-rand(5, 200)),
        },
      });
    }
  }

  // -------- FR-06: Budget Mengurus (OS28000 & OS26000) --------
  console.log("🌱 Seeding FR-06: budget mengurus...");
  const months2026 = Array.from({ length: 7 }, (_, i) => new Date(2026, i, 1)); // Jan-Jul 2026
  for (const code of ["OS28000", "OS26000"]) {
    for (const m of months2026) {
      const allocation = code === "OS28000" ? rand(120000, 180000) : rand(60000, 95000);
      const spent = Math.round(allocation * (0.55 + Math.random() * 0.5));
      await db.tblBudgetMengurus.create({
        data: {
          budgetCode: code,
          month: m,
          allocation,
          spent,
          balance: allocation - spent,
          remarks: pick(["Perbelanjaan dalam julat normal", "Pemantauan diperlukan", ""])
        },
      });
    }
  }

  // -------- FR-07: Budget Pembangunan --------
  console.log("🌱 Seeding FR-07: budget pembangunan...");
  const projectNames = [
    "Naik Taraf Makmal Automotif",
    "Penyelenggaraan Sistem Pendingin Auditorium",
    "Naik Taraf Makmal CNC",
    "Penyelenggaraan Struktur Bumbung Blok B",
    "Pemasangan Sistem Solar PV",
    "Naik Taraf Makmal Elektrik",
    "Penyelenggaraan Sistem Bomba",
    "Naik Taraf Pusat Sumber",
  ];
  for (let i = 0; i < projectNames.length; i++) {
    const allocation = rand(200000, 850000);
    const completion = rand(10, 95);
    const spent = Math.round(allocation * (completion / 100) * (0.85 + Math.random() * 0.3));
    const status = completion > 85 ? "Siap" : completion > 0 ? "Dalam Pelaksanaan" : "Belum Mula";
    await db.tblBudgetPembangunan.create({
      data: {
        projectName: projectNames[i],
        category: pick(["Penyelenggaraan", "Naik Taraf"]),
        allocation,
        spent,
        completionPct: completion,
        status,
        targetDate: daysFromNow(rand(-30, 240)),
      },
    });
  }

  // -------- FR-08: Stock Verification --------
  console.log("🌱 Seeding FR-08: stock verification...");
  const stockItems = [
    ["STK-001", "Kertas A4 80gsm (rim)", "Alat Tulis"],
    ["STK-002", "Toner HP CF259A", "ICT"],
    ["STK-003", "Kabel PVC 2.5mm (gulung)", "Elektrik"],
    ["STK-004", "Elektrod Kimpalan E6013 (kotak)", "Pembuatan"],
    ["STK-005", "Minyak Enjin SAE 40 (liter)", "Automotif"],
    ["STK-006", "Cat Industri Putih (tin)", "Pembinaan"],
    ["STK-007", "Pemutus Litar 32A", "Elektrik"],
    ["STK-008", "Mata Gerudi 6mm", "Pembuatan"],
    ["STK-009", "Pen Marker Pelbagai Warna", "Alat Tulis"],
    ["STK-010", "Pita Penebat Elektrik", "Elektrik"],
    ["STK-011", "Sarung Tangan Lasak", "Automotif"],
    ["STK-012", "Cecair Pendingin Enjin (liter)", "Automotif"],
    ["STK-013", "Fail Plastik A4", "Alat Tulis"],
    ["STK-014", "Stapler Gun", "Alat Tulis"],
    ["STK-015", "Cakera Pemotong 4\"", "Pembuatan"],
    ["STK-016", "Wayar Soket 13A", "Elektrik"],
    ["STK-017", "Lampu LED 18W", "Elektrik"],
    ["STK-018", "Roda Pengilap", "Pembuatan"],
  ];
  for (const [code, name, cat] of stockItems) {
    const sysQty = rand(20, 200);
    const variance = Math.random() > 0.6 ? rand(-15, 10) : rand(-2, 2);
    const physQty = sysQty + variance;
    await db.tblStockVerification.create({
      data: {
        itemCode: code,
        itemName: name,
        systemQty: sysQty,
        physicalQty: physQty,
        variance,
        verifiedBy: pick(malayNames),
        verifyDate: daysFromNow(-rand(1, 60)),
        status: Math.abs(variance) <= 2 ? "Sepadan" : "Percanggahan",
        category: cat,
      },
    });
  }

  // -------- FR-09: Short Course Enrolment --------
  console.log("🌱 Seeding FR-09: short course enrolment...");
  const shortCourses = [
    "Pengaturcaraan Web Asas",
    "Pemesinan CNC Tahap Pengenalan",
    "Penyelenggaraan Kenderaan Hybrid",
    "Reka Bentuk Grafik Digital",
    "Pemasangan Solar PV",
    "Kimpalan TIG Asas",
    "Pengurusan Kafe & Barista",
    "Penyaman Udara Domestik",
    "Pemulihan & Penyelenggaraan Komputer",
    "Fotografi Digital Profesional",
    "Pemasangan Pintar Rumah (Smart Home)",
    "Analisis Data Excel Lanjutan",
  ];
  for (const c of shortCourses) {
    const capacity = rand(20, 40);
    const participants = Math.round(capacity * (0.55 + Math.random() * 0.5));
    await db.tblShortCourseEnrolment.create({
      data: {
        courseName: c,
        programId: pick(programIds),
        sessionDate: daysFromNow(-rand(5, 120)),
        capacity,
        participantCount: participants,
        category: pick(["Awam", "Korporat"]),
        revenue: participants * rand(350, 1200),
      },
    });
  }

  // -------- FR-10: Graduates --------
  console.log("🌱 Seeding FR-10: graduates...");
  const empStatus = ["Bekerja", "Bekerja", "Bekerja", "Belum Bekerja", "Melanjut Pelajaran"];
  for (const s of sessionNames) {
    const count = rand(25, 45);
    for (let i = 0; i < count; i++) {
      await db.tblGraduate.create({
        data: {
          fullName: pick(malayNames) + ` ${i}`,
          programId: pick(programIds),
          sessionName: s,
          graduationDate: daysFromNow(-rand(30, 500)),
          finalGrade: pick(["A", "A-", "B+", "B", "B-", "C+"]),
          employmentStatus: pick(empStatus),
        },
      });
    }
  }

  // -------- FR-11: Trust Account --------
  console.log("🌱 Seeding FR-11: trust account...");
  let running = 250000;
  const incomeCats = ["Yuran Kursus Jangka Pendek", "Sewa Kemudahan", "Jualan Projek", "Derma"];
  const expenseCats = ["Bahan Guna Habis", "Penyelenggaraan", "Utiliti", "Insentif"];
  for (let i = 0; i < 24; i++) {
    const isIncome = Math.random() > 0.45;
    const amount = isIncome ? rand(8000, 35000) : rand(5000, 28000);
    running += isIncome ? amount : -amount;
    await db.tblTrustAccount.create({
      data: {
        transactionType: isIncome ? "Income" : "Expense",
        category: isIncome ? pick(incomeCats) : pick(expenseCats),
        amount,
        transactionDate: daysFromNow(-rand(1, 200)),
        runningBalance: running,
        description: isIncome ? "Penerimaan pendapatan Akaun Amanah" : "Perbelanjaan Akaun Amanah",
      },
    });
  }

  // -------- FR-12: Mengurus Account --------
  console.log("🌱 Seeding FR-12: mengurus account...");
  const accounts = [
    ["21000", "Gaji & Elaun Tahunan"],
    ["27000", "Perkhidmatan"],
    ["28000", "Penyelenggaraan"],
    ["26000", "Bekalan & Bahan Guna Habis"],
    ["29000", "Peralatan"],
    ["23000", "Perjalanan & Pengangkutan"],
  ];
  for (const [code, name] of accounts) {
    const allocation = rand(300000, 1500000);
    const spent = Math.round(allocation * (0.4 + Math.random() * 0.55));
    await db.tblMengurusAccount.create({
      data: {
        accountCode: code,
        accountName: name,
        allocation,
        spent,
        month: new Date(2026, 5, 1),
      },
    });
  }

  // -------- FR-13: Asset Monitoring --------
  console.log("🌱 Seeding FR-13: asset monitoring...");
  const assets = [
    ["KEW.PA-0231", "Projektor LCD", "Bilik Kuliah A1", "Baik"],
    ["KEW.PA-0455", "Mesin Kimpalan CNC", "Makmal Kimpalan 2", "Perlu Baiki"],
    ["KEW.PA-0678", "Penghawa Dingin 2HP", "Pejabat Pentadbiran", "Baik"],
    ["KEW.PA-0912", "Komputer Makmal Dell", "Makmal Komputer 3", "Baik"],
    ["KEW.PA-1023", "Mesin Jahit Industri", "Bengkel Jahitan", "Rosak"],
    ["KEW.PA-1156", "Mesin Gerudi Lantai", "Bengkel Mesin", "Baik"],
    ["KEW.PA-1278", "Papan Putih Interaktif", "Bilik Kuliah B2", "Baik"],
    ["KEW.PA-1345", "Pencetak Laser 3D", "Makmal Inovasi", "Perlu Baiki"],
    ["KEW.PA-1422", "Dapur Gas Komersial", "Dapur Latihan Katering", "Baik"],
    ["KEW.PA-1587", "Mesin Pemesin CNC Lathe", "Bengkel CNC", "Baik"],
    ["KEW.PA-1644", "Skru Pemampat Udara", "Bengkel Automotif", "Perlu Baiki"],
    ["KEW.PA-1789", "Penjana Kuasa 10kVA", "Bilik Janakuasa", "Baik"],
    ["KEW.PA-1823", "Kamera DSLR Latihan", "Studio Fotografi", "Baik"],
    ["KEW.PA-1901", "Simulator Pemanduan", "Bengkel Automotif", "Rosak"],
    ["KEW.PA-2055", "Sistem PA Auditorium", "Auditorium", "Baik"],
  ];
  for (const [code, name, loc, cond] of assets) {
    const lastCheck = daysFromNow(-rand(10, 300));
    const nextCheck = daysFromNow(rand(-30, 200));
    const overdue = nextCheck.getTime() < Date.now();
    await db.tblAssetMonitoring.create({
      data: {
        assetCode: code,
        assetName: name,
        location: loc,
        condition: cond,
        lastCheckDate: lastCheck,
        nextCheckDate: nextCheck,
        status: overdue ? "Tertunggak" : "Terkini",
        category: pick(["Peralatan Bengkel", "ICT", "Kemudahan", "Pengajaran"]),
      },
    });
  }

  // -------- FR-14: Computer Inventory --------
  console.log("🌱 Seeding FR-14: computer inventory...");
  const labs = ["Makmal Komputer 1", "Makmal Komputer 2", "Makmal Komputer 3", "Makmal CAD/CAM", "Pejabat Pentadbiran", "Pusat Sumber"];
  const brands = [
    ["Dell OptiPlex 7080", "Windows 11 Pro"],
    ["HP ProDesk 600 G6", "Windows 11 Pro"],
    ["Lenovo ThinkCentre M90", "Windows 10 Pro"],
    ["Dell Precision 3650", "Windows 11 Pro"],
    ["Asus ExpertCenter D7", "Windows 11 Pro"],
  ];
  for (let i = 0; i < 75; i++) {
    const [bm, os] = pick(brands);
    const yr = rand(2018, 2024);
    const r = Math.random();
    const status = r > 0.85 ? "Rosak" : r > 0.75 ? "Penyelenggaraan" : "Berfungsi";
    await db.tblComputerInventory.create({
      data: {
        assetTag: `PC-${String(10001 + i)}`,
        location: pick(labs),
        brandModel: bm,
        purchaseYear: yr,
        status,
        osVersion: os,
      },
    });
  }

  // -------- Audit Log --------
  console.log("🌱 Seeding audit log...");
  for (let i = 0; i < 8; i++) {
    await db.tblAuditLog.create({
      data: {
        userId: pick(staffIds),
        action: pick(["CREATE", "UPDATE", "DELETE"]),
        module: pick(["FR-01", "FR-02", "FR-06", "FR-13"]),
        recordId: `rec-${1000 + i}`,
        detail: "Pengemaskinian rekod oleh pegawai bertugas.",
        createdAt: daysFromNow(-rand(1, 10)),
      },
    });
  }

  console.log("\n✅ Seed complete!");
  const counts = {
    "tbl_program": await db.tblProgram.count(),
    "tbl_session": await db.tblSession.count(),
    "tbl_staff": await db.tblStaff.count(),
    "FR-01 tbl_enrolment_fulltime": await db.tblEnrolmentFulltime.count(),
    "FR-02 tbl_customer_complaints": await db.tblCustomerComplaint.count(),
    "FR-03 tbl_program_accreditation": await db.tblProgramAccreditation.count(),
    "FR-04 tbl_instructor_certification": await db.tblInstructorCertification.count(),
    "FR-05 tbl_staff_training": await db.tblStaffTraining.count(),
    "FR-06 tbl_budget_mengurus": await db.tblBudgetMengurus.count(),
    "FR-07 tbl_budget_pembangunan": await db.tblBudgetPembangunan.count(),
    "FR-08 tbl_stock_verification": await db.tblStockVerification.count(),
    "FR-09 tbl_short_course_enrolment": await db.tblShortCourseEnrolment.count(),
    "FR-10 tbl_graduates": await db.tblGraduate.count(),
    "FR-11 tbl_trust_account": await db.tblTrustAccount.count(),
    "FR-12 tbl_mengurus_account": await db.tblMengurusAccount.count(),
    "FR-13 tbl_asset_monitoring": await db.tblAssetMonitoring.count(),
    "FR-14 tbl_computer_inventory": await db.tblComputerInventory.count(),
  };
  console.table(counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
