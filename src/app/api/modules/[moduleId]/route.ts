import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/modules/[moduleId]
// Detailed data (chart series + table records) for a single module FR-01 .. FR-14.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await params;
  try {
    switch (moduleId) {
      case "FR-01":
        return NextResponse.json(await fr01());
      case "FR-02":
        return NextResponse.json(await fr02());
      case "FR-03":
        return NextResponse.json(await fr03());
      case "FR-04":
        return NextResponse.json(await fr04());
      case "FR-05":
        return NextResponse.json(await fr05());
      case "FR-06":
        return NextResponse.json(await fr06());
      case "FR-07":
        return NextResponse.json(await fr07());
      case "FR-08":
        return NextResponse.json(await fr08());
      case "FR-09":
        return NextResponse.json(await fr09());
      case "FR-10":
        return NextResponse.json(await fr10());
      case "FR-11":
        return NextResponse.json(await fr11());
      case "FR-12":
        return NextResponse.json(await fr12());
      case "FR-13":
        return NextResponse.json(await fr13());
      case "FR-14":
        return NextResponse.json(await fr14());
      default:
        return NextResponse.json({ error: "Modul tidak dijumpai" }, { status: 404 });
    }
  } catch (err) {
    console.error(`[/api/modules/${moduleId}] error`, err);
    return NextResponse.json(
      { error: "Gagal memuatkan data modul", detail: String(err) },
      { status: 500 },
    );
  }
}

// ---------- FR-01 Enrolment ----------
async function fr01() {
  const rows = await db.tblEnrolmentFulltime.findMany({ orderBy: { sessionName: "asc" } });
  const bySession: Record<string, any> = {};
  for (const r of rows) {
    if (!bySession[r.sessionName]) bySession[r.sessionName] = { target: 0, enrolled: 0, male: 0, female: 0 };
    bySession[r.sessionName].target += r.targetIntake;
    bySession[r.sessionName].enrolled += r.actualEnrolled;
    bySession[r.sessionName].male += r.genderMale;
    bySession[r.sessionName].female += r.genderFemale;
  }
  const chartSeries = Object.entries(bySession).map(([k, v]) => ({
    session: k,
    Sasaran: v.target,
    Sebenar: v.enrolled,
    pct: v.target ? Math.round((v.enrolled / v.target) * 1000) / 10 : 0,
  }));
  const byCenter: Record<string, any> = {};
  for (const r of rows) {
    if (!byCenter[r.centerName]) byCenter[r.centerName] = { target: 0, enrolled: 0 };
    byCenter[r.centerName].target += r.targetIntake;
    byCenter[r.centerName].enrolled += r.actualEnrolled;
  }
  const centerSeries = Object.entries(byCenter)
    .map(([k, v]) => ({ center: k, Sasaran: v.target, Sebenar: v.enrolled }))
    .sort((a, b) => b.Sebenar - a.Sebenar);
  const totalMale = rows.reduce((s, r) => s + r.genderMale, 0);
  const totalFemale = rows.reduce((s, r) => s + r.genderFemale, 0);
  return {
    title: "Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa",
    kpi: {
      totalTarget: rows.reduce((s, r) => s + r.targetIntake, 0),
      totalEnrolled: rows.reduce((s, r) => s + r.actualEnrolled, 0),
      pct: pct(rows.reduce((s, r) => s + r.actualEnrolled, 0), rows.reduce((s, r) => s + r.targetIntake, 0)),
    },
    charts: {
      sessionTrend: chartSeries,
      byCenter: centerSeries,
      gender: [
        { name: "Lelaki", value: totalMale },
        { name: "Perempuan", value: totalFemale },
      ],
    },
    table: rows.slice(0, 40).map((r) => ({
      session: r.sessionName,
      center: r.centerName,
      target: r.targetIntake,
      enrolled: r.actualEnrolled,
      pct: pct(r.actualEnrolled, r.targetIntake),
      male: r.genderMale,
      female: r.genderFemale,
    })),
  };
}

// ---------- FR-02 Complaints ----------
async function fr02() {
  const rows = await db.tblCustomerComplaint.findMany({ orderBy: { dateReceived: "desc" } });
  const byCat = countBy(rows, "category");
  const byStatus = countBy(rows, "status");
  const byType = countBy(rows, "complainantType");
  const monthly: Record<string, number> = {};
  for (const r of rows) {
    const k = r.dateReceived.toISOString().slice(0, 7);
    monthly[k] = (monthly[k] || 0) + 1;
  }
  const monthlySeries = Object.entries(monthly)
    .map(([k, v]) => ({ month: k, aduan: v }))
    .sort((a, b) => a.month.localeCompare(b.month));
  const resolved = rows.filter((r) => r.status === "Selesai");
  const withinSla = resolved.filter((r) => (r.responseTimeHours ?? 999) <= r.slaTargetHours).length;
  const avgResp = resolved.length
    ? Math.round((resolved.reduce((s, r) => s + (r.responseTimeHours || 0), 0) / resolved.length) * 10) / 10
    : 0;
  return {
    title: "Pemantauan Aduan Pelanggan",
    kpi: {
      total: rows.length,
      resolved: resolved.length,
      open: rows.length - resolved.length,
      slaPct: pct(withinSla, resolved.length),
      avgResponseHours: avgResp,
    },
    charts: {
      byCategory: Object.entries(byCat).map(([k, v]) => ({ name: k, value: v })),
      byStatus: Object.entries(byStatus).map(([k, v]) => ({ name: k, value: v })),
      monthly: monthlySeries,
      byType: Object.entries(byType).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows.slice(0, 40).map((r) => ({
      ref: r.complaintRef,
      date: r.dateReceived.toISOString().slice(0, 10),
      category: r.category,
      status: r.status,
      complainantType: r.complainantType,
      responseHours: r.responseTimeHours,
      sla: r.slaTargetHours,
      withinSla: r.status === "Selesai" && (r.responseTimeHours ?? 999) <= r.slaTargetHours,
    })),
  };
}

// ---------- FR-03 Accreditation ----------
async function fr03() {
  const rows = await db.tblProgramAccreditation.findMany({ orderBy: { expiryDate: "asc" } });
  const now = Date.now();
  const day = 86400000;
  const buckets: Record<string, number> = { "Luput": 0, "< 30 hari": 0, "30-90 hari": 0, "> 90 hari": 0 };
  for (const r of rows) {
    if (!r.expiryDate) continue;
    const d = r.expiryDate.getTime() - now;
    if (d < 0) buckets["Luput"]++;
    else if (d <= 30 * day) buckets["< 30 hari"]++;
    else if (d <= 90 * day) buckets["30-90 hari"]++;
    else buckets["> 90 hari"]++;
  }
  return {
    title: "Pentauliahan Program Sepenuh Masa",
    kpi: {
      total: rows.length,
      aktif: rows.filter((r) => r.status === "Aktif").length,
      akanLuput: rows.filter((r) => r.status === "Akan Luput").length,
      luput: rows.filter((r) => r.status === "Luput").length,
    },
    charts: {
      byStatus: Object.entries(buckets).map(([k, v]) => ({ name: k, value: v })),
      byBody: Object.entries(countBy(rows, "accreditationBody")).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows.map((r) => ({
      program: r.programName,
      body: r.accreditationBody,
      certNo: r.certNo,
      start: r.startDate?.toISOString().slice(0, 10),
      expiry: r.expiryDate?.toISOString().slice(0, 10),
      status: r.status,
      daysToExpiry: r.expiryDate ? Math.round((r.expiryDate.getTime() - now) / day) : null,
    })),
  };
}

// ---------- FR-04 Instructor Certification ----------
async function fr04() {
  const rows = await db.tblInstructorCertification.findMany();
  const byLevel = countBy(rows.filter((r) => r.certLevel), "certLevel");
  return {
    title: "Sijil Kemahiran Malaysia (SKM) Pengajar DV",
    kpi: {
      total: rows.length,
      certified: rows.filter((r) => r.certLevel).length,
      uncertified: rows.filter((r) => !r.certLevel).length,
      pct: pct(rows.filter((r) => r.certLevel).length, rows.length),
    },
    charts: {
      byLevel: [
        { name: "SKM3", value: byLevel["SKM3"] || 0 },
        { name: "DKM", value: byLevel["DKM"] || 0 },
        { name: "DLKM", value: byLevel["DLKM"] || 0 },
        { name: "Tiada Sijil", value: rows.filter((r) => !r.certLevel).length },
      ],
      byDept: Object.entries(countBy(rows, "department")).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows.map((r) => ({
      name: r.fullName,
      department: r.department,
      certLevel: r.certLevel || "—",
      certNo: r.certNo || "—",
      issue: r.issueDate?.toISOString().slice(0, 10),
      expiry: r.expiryDate?.toISOString().slice(0, 10),
    })),
  };
}

// ---------- FR-05 Staff Training ----------
async function fr05() {
  const rows = await db.tblStaffTraining.findMany({ where: { year: 2026 }, orderBy: { hoursCompleted: "asc" } });
  const byDept: Record<string, any> = {};
  for (const r of rows) {
    const k = r.department || "Lain-lain";
    if (!byDept[k]) byDept[k] = { hours: 0, count: 0, compliant: 0 };
    byDept[k].hours += r.hoursCompleted;
    byDept[k].count += 1;
    byDept[k].compliant += r.hoursCompleted >= r.targetHours ? 1 : 0;
  }
  const deptSeries = Object.entries(byDept).map(([k, v]) => ({
    department: k,
    avgHours: Math.round((v.hours / v.count) * 10) / 10,
    compliantPct: pct(v.compliant, v.count),
  }));
  return {
    title: "Pemantauan Kursus Tahunan Kakitangan (40 Jam)",
    kpi: {
      total: rows.length,
      compliant: rows.filter((r) => r.hoursCompleted >= r.targetHours).length,
      atRisk: rows.filter((r) => r.hoursCompleted < r.targetHours * 0.6).length,
      avgHours: rows.length
        ? Math.round((rows.reduce((s, r) => s + r.hoursCompleted, 0) / rows.length) * 10) / 10
        : 0,
    },
    charts: {
      byDepartment: deptSeries,
      distribution: [
        { name: "Patuh (≥40j)", value: rows.filter((r) => r.hoursCompleted >= 40).length },
        { name: "Hampir (24-39j)", value: rows.filter((r) => r.hoursCompleted >= 24 && r.hoursCompleted < 40).length },
        { name: "Berisiko (<24j)", value: rows.filter((r) => r.hoursCompleted < 24).length },
      ],
    },
    table: rows.map((r) => ({
      name: r.fullName,
      department: r.department,
      hours: r.hoursCompleted,
      target: r.targetHours,
      pct: pct(r.hoursCompleted, r.targetHours),
      lastCourse: r.lastCourseDate?.toISOString().slice(0, 10),
    })),
  };
}

// ---------- FR-06 Budget Mengurus ----------
async function fr06() {
  const rows = await db.tblBudgetMengurus.findMany({ orderBy: { month: "asc" } });
  const byCode: Record<string, any> = {};
  const monthly: Record<string, any> = {};
  for (const r of rows) {
    if (!byCode[r.budgetCode]) byCode[r.budgetCode] = { allocation: 0, spent: 0 };
    byCode[r.budgetCode].allocation += r.allocation;
    byCode[r.budgetCode].spent += r.spent;
    const m = r.month.toISOString().slice(0, 7);
    if (!monthly[m]) monthly[m] = { allocation: 0, spent: 0 };
    monthly[m].allocation += r.allocation;
    monthly[m].spent += r.spent;
  }
  return {
    title: "Bajet Mengurus (OS28000 & OS26000)",
    kpi: {
      totalAllocation: rows.reduce((s, r) => s + r.allocation, 0),
      totalSpent: rows.reduce((s, r) => s + r.spent, 0),
      totalBalance: rows.reduce((s, r) => s + r.balance, 0),
      pct: pct(rows.reduce((s, r) => s + r.spent, 0), rows.reduce((s, r) => s + r.allocation, 0)),
    },
    charts: {
      byCode: Object.entries(byCode).map(([k, v]) => ({
        code: k,
        Peruntukan: v.allocation,
        Perbelanjaan: v.spent,
        pct: pct(v.spent, v.allocation),
      })),
      monthly: Object.entries(monthly).map(([k, v]) => ({
        month: k,
        Peruntukan: v.allocation,
        Perbelanjaan: v.spent,
      })),
    },
    table: rows.map((r) => ({
      code: r.budgetCode,
      month: r.month.toISOString().slice(0, 7),
      allocation: r.allocation,
      spent: r.spent,
      balance: r.balance,
      pct: pct(r.spent, r.allocation),
      remarks: r.remarks,
    })),
  };
}

// ---------- FR-07 Budget Pembangunan ----------
async function fr07() {
  const rows = await db.tblBudgetPembangunan.findMany({ orderBy: { completionPct: "desc" } });
  return {
    title: "Bajet Pembangunan (Penyelenggaraan/Naik Taraf)",
    kpi: {
      totalProjects: rows.length,
      inProgress: rows.filter((r) => r.status === "Dalam Pelaksanaan").length,
      completed: rows.filter((r) => r.status === "Siap").length,
      totalAllocation: rows.reduce((s, r) => s + r.allocation, 0),
      totalSpent: rows.reduce((s, r) => s + r.spent, 0),
      avgCompletion: rows.length
        ? Math.round((rows.reduce((s, r) => s + r.completionPct, 0) / rows.length) * 10) / 10
        : 0,
    },
    charts: {
      byStatus: Object.entries(countBy(rows, "status")).map(([k, v]) => ({ name: k, value: v })),
      byCategory: Object.entries(countBy(rows, "category")).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows.map((r) => ({
      name: r.projectName,
      category: r.category,
      allocation: r.allocation,
      spent: r.spent,
      financePct: pct(r.spent, r.allocation),
      physicalPct: r.completionPct,
      status: r.status,
      targetDate: r.targetDate?.toISOString().slice(0, 10),
    })),
  };
}

// ---------- FR-08 Stock Verification ----------
async function fr08() {
  const rows = await db.tblStockVerification.findMany({ orderBy: { verifyDate: "desc" } });
  return {
    title: "Pemantauan Verifikasi Stok",
    kpi: {
      total: rows.length,
      match: rows.filter((r) => r.status === "Sepadan").length,
      mismatch: rows.filter((r) => r.status === "Percanggahan").length,
      accuracyPct: pct(rows.filter((r) => r.status === "Sepadan").length, rows.length),
    },
    charts: {
      byCategory: Object.entries(countBy(rows, "category")).map(([k, v]) => ({ name: k, value: v })),
      byStatus: Object.entries(countBy(rows, "status")).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows.map((r) => ({
      code: r.itemCode,
      name: r.itemName,
      category: r.category,
      systemQty: r.systemQty,
      physicalQty: r.physicalQty,
      variance: r.variance,
      status: r.status,
      verifiedBy: r.verifiedBy,
      verifyDate: r.verifyDate?.toISOString().slice(0, 10),
    })),
  };
}

// ---------- FR-09 Short Course ----------
async function fr09() {
  const rows = await db.tblShortCourseEnrolment.findMany({ orderBy: { revenue: "desc" } });
  const monthly: Record<string, any> = {};
  for (const r of rows) {
    const m = r.sessionDate.toISOString().slice(0, 7);
    if (!monthly[m]) monthly[m] = { revenue: 0, participants: 0 };
    monthly[m].revenue += r.revenue;
    monthly[m].participants += r.participantCount;
  }
  return {
    title: "Enrolmen Peserta Kursus Jangka Pendek",
    kpi: {
      totalCourses: rows.length,
      totalParticipants: rows.reduce((s, r) => s + r.participantCount, 0),
      totalCapacity: rows.reduce((s, r) => s + r.capacity, 0),
      totalRevenue: rows.reduce((s, r) => s + r.revenue, 0),
      fillPct: pct(rows.reduce((s, r) => s + r.participantCount, 0), rows.reduce((s, r) => s + r.capacity, 0)),
    },
    charts: {
      topCourses: rows.slice(0, 8).map((r) => ({
        course: r.courseName.length > 22 ? r.courseName.slice(0, 22) + "…" : r.courseName,
        participants: r.participantCount,
        capacity: r.capacity,
      })),
      byCategory: Object.entries(countBy(rows, "category")).map(([k, v]) => ({ name: k, value: v })),
      revenueMonthly: Object.entries(monthly).map(([k, v]) => ({
        month: k,
        hasil: v.revenue,
        peserta: v.participants,
      })),
    },
    table: rows.map((r) => ({
      course: r.courseName,
      date: r.sessionDate.toISOString().slice(0, 10),
      capacity: r.capacity,
      participants: r.participantCount,
      fillPct: pct(r.participantCount, r.capacity),
      category: r.category,
      revenue: r.revenue,
    })),
  };
}

// ---------- FR-10 Graduates ----------
async function fr10() {
  const rows = await db.tblGraduate.findMany({ orderBy: { graduationDate: "desc" } });
  const bySession = countBy(rows, "sessionName");
  const byStatus = countBy(rows, "employmentStatus");
  const byGrade = countBy(rows, "finalGrade");
  return {
    title: "Senarai Pelajar Sepenuh Masa Bergraduat",
    kpi: {
      total: rows.length,
      employed: rows.filter((r) => r.employmentStatus === "Bekerja").length,
      further: rows.filter((r) => r.employmentStatus === "Melanjut Pelajaran").length,
      unemployed: rows.filter((r) => r.employmentStatus === "Belum Bekerja").length,
      employabilityPct: pct(rows.filter((r) => r.employmentStatus === "Bekerja").length, rows.length),
    },
    charts: {
      bySession: Object.entries(bySession).map(([k, v]) => ({ name: k, value: v })),
      byStatus: Object.entries(byStatus).map(([k, v]) => ({ name: k || "Tidak Diketahui", value: v })),
      byGrade: Object.entries(byGrade).map(([k, v]) => ({ name: k || "—", value: v })),
    },
    table: rows.slice(0, 50).map((r) => ({
      name: r.fullName,
      session: r.sessionName,
      grade: r.finalGrade,
      graduation: r.graduationDate?.toISOString().slice(0, 10),
      employment: r.employmentStatus,
    })),
  };
}

// ---------- FR-11 Trust Account ----------
async function fr11() {
  const rows = await db.tblTrustAccount.findMany({ orderBy: { transactionDate: "asc" } });
  const monthly: Record<string, any> = {};
  for (const r of rows) {
    const m = r.transactionDate.toISOString().slice(0, 7);
    if (!monthly[m]) monthly[m] = { income: 0, expense: 0, balance: 0 };
    if (r.transactionType === "Income") monthly[m].income += r.amount;
    else monthly[m].expense += r.amount;
    monthly[m].balance = r.runningBalance;
  }
  const income = rows.filter((r) => r.transactionType === "Income").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.transactionType === "Expense").reduce((s, r) => s + r.amount, 0);
  return {
    title: "Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)",
    kpi: {
      totalIncome: income,
      totalExpense: expense,
      balance: rows.length ? rows[rows.length - 1].runningBalance : 0,
      ratio: expense ? Math.round((income / expense) * 100) / 100 : 0,
    },
    charts: {
      monthly: Object.entries(monthly).map(([k, v]) => ({
        month: k,
        Pendapatan: v.income,
        Perbelanjaan: v.expense,
        Baki: v.balance,
      })),
      byCategory: Object.entries(countBy(rows, "category")).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows.slice(-25).reverse().map((r) => ({
      date: r.transactionDate.toISOString().slice(0, 10),
      type: r.transactionType,
      category: r.category,
      amount: r.amount,
      balance: r.runningBalance,
    })),
  };
}

// ---------- FR-12 Mengurus Account ----------
async function fr12() {
  const rows = await db.tblMengurusAccount.findMany({ orderBy: { spent: "desc" } });
  return {
    title: "Pemantauan Akaun Mengurus (Peratus Perbelanjaan)",
    kpi: {
      totalAccounts: rows.length,
      totalAllocation: rows.reduce((s, r) => s + r.allocation, 0),
      totalSpent: rows.reduce((s, r) => s + r.spent, 0),
      pct: pct(rows.reduce((s, r) => s + r.spent, 0), rows.reduce((s, r) => s + r.allocation, 0)),
      over90: rows.filter((r) => r.spent / r.allocation > 0.9).length,
    },
    charts: {
      byAccount: rows.map((r) => ({
        code: r.accountCode,
        name: r.accountName,
        Peruntukan: r.allocation,
        Perbelanjaan: r.spent,
        pct: pct(r.spent, r.allocation),
      })),
    },
    table: rows.map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      allocation: r.allocation,
      spent: r.spent,
      balance: r.allocation - r.spent,
      pct: pct(r.spent, r.allocation),
      status:
        r.spent / r.allocation > 0.9 ? "Kritikal" : r.spent / r.allocation > 0.7 ? "Amaran" : "Selamat",
    })),
  };
}

// ---------- FR-13 Asset Monitoring ----------
async function fr13() {
  const rows = await db.tblAssetMonitoring.findMany();
  const now = Date.now();
  const day = 86400000;
  return {
    title: "Pemantauan Aset (Semakan Aset)",
    kpi: {
      total: rows.length,
      baik: rows.filter((r) => r.condition === "Baik").length,
      perluBaiki: rows.filter((r) => r.condition === "Perlu Baiki").length,
      rosak: rows.filter((r) => r.condition === "Rosak").length,
      overdue: rows.filter((r) => r.status === "Tertunggak").length,
      compliancePct: pct(rows.filter((r) => r.status === "Terkini").length, rows.length),
    },
    charts: {
      byCondition: [
        { name: "Baik", value: rows.filter((r) => r.condition === "Baik").length },
        { name: "Perlu Baiki", value: rows.filter((r) => r.condition === "Perlu Baiki").length },
        { name: "Rosak", value: rows.filter((r) => r.condition === "Rosak").length },
      ],
      byLocation: Object.entries(countBy(rows, "location")).map(([k, v]) => ({ name: k, value: v })),
      byCategory: Object.entries(countBy(rows, "category")).map(([k, v]) => ({ name: k, value: v })),
    },
    table: rows
      .map((r) => ({
        code: r.assetCode,
        name: r.assetName,
        location: r.location,
        condition: r.condition,
        lastCheck: r.lastCheckDate?.toISOString().slice(0, 10),
        nextCheck: r.nextCheckDate?.toISOString().slice(0, 10),
        status: r.status,
        daysOverdue: r.nextCheckDate ? Math.round((now - r.nextCheckDate.getTime()) / day) : 0,
      }))
      .sort((a, b) => (a.status === "Tertunggak" ? -1 : 1) - (b.status === "Tertunggak" ? -1 : 1)),
  };
}

// ---------- FR-14 Computer Inventory ----------
async function fr14() {
  const rows = await db.tblComputerInventory.findMany();
  const byLab = countBy(rows, "location");
  const oldPcs = rows.filter((r) => (r.purchaseYear || 2024) <= 2020);
  return {
    title: "Pemantauan Bilangan Komputer",
    kpi: {
      total: rows.length,
      ok: rows.filter((r) => r.status === "Berfungsi").length,
      maintenance: rows.filter((r) => r.status === "Penyelenggaraan").length,
      broken: rows.filter((r) => r.status === "Rosak").length,
      oldNeedsReplacement: oldPcs.length,
      okPct: pct(rows.filter((r) => r.status === "Berfungsi").length, rows.length),
    },
    charts: {
      byStatus: [
        { name: "Berfungsi", value: rows.filter((r) => r.status === "Berfungsi").length },
        { name: "Penyelenggaraan", value: rows.filter((r) => r.status === "Penyelenggaraan").length },
        { name: "Rosak", value: rows.filter((r) => r.status === "Rosak").length },
      ],
      byLab: Object.entries(byLab).map(([k, v]) => ({ name: k, value: v })),
      byAge: [
        { name: "≤ 2 tahun", value: rows.filter((r) => (r.purchaseYear || 0) >= 2024).length },
        { name: "3-4 tahun", value: rows.filter((r) => (r.purchaseYear || 0) >= 2022 && (r.purchaseYear || 0) < 2024).length },
        { name: "5-6 tahun", value: rows.filter((r) => (r.purchaseYear || 0) >= 2020 && (r.purchaseYear || 0) < 2022).length },
        { name: "> 6 tahun", value: rows.filter((r) => (r.purchaseYear || 0) < 2020).length },
      ],
    },
    table: oldPcs
      .map((r) => ({
        tag: r.assetTag,
        location: r.location,
        brand: r.brandModel,
        year: r.purchaseYear,
        age: 2026 - (r.purchaseYear || 2026),
        status: r.status,
        os: r.osVersion,
      }))
      .sort((a, b) => a.year - b.year),
  };
}

// ---------- helpers ----------
function pct(n: number, d: number, dec = 1): number {
  if (!d) return 0;
  const f = Math.pow(10, dec);
  return Math.round((n / d) * 100 * f) / f;
}
function countBy<T extends Record<string, unknown>>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, r) => {
    const v = String(r[key] ?? "Tidak Diketahui");
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
}
