import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard
// Aggregated executive summary across all 14 modules for the landing dashboard.
// Mirrors the "Ringkasan Eksekutif" KPI cards described in PRD section 4.
export async function GET() {
  try {
    // ---------- FR-01 Enrolment Full-time ----------
    const enrolRows = await db.tblEnrolmentFulltime.groupBy({
      by: ["sessionName"],
      _sum: { targetIntake: true, actualEnrolled: true, genderMale: true, genderFemale: true },
      _count: true,
      orderBy: { sessionName: "asc" },
    });
    const enrolTotalTarget = enrolRows.reduce((s, r) => s + (r._sum.targetIntake || 0), 0);
    const enrolTotalActual = enrolRows.reduce((s, r) => s + (r._sum.actualEnrolled || 0), 0);
    const enrolPct = enrolTotalTarget ? Math.round((enrolTotalActual / enrolTotalTarget) * 1000) / 10 : 0;

    const latestSession = enrolRows[enrolRows.length - 1];
    const prevSession = enrolRows[enrolRows.length - 2];
    const enrolTrend =
      latestSession && prevSession
        ? Math.round(
            (((latestSession._sum.actualEnrolled || 0) - (prevSession._sum.actualEnrolled || 0)) /
              Math.max(prevSession._sum.actualEnrolled || 1, 1)) *
              1000,
          ) / 10
        : 0;

    // ---------- FR-02 Customer Complaints ----------
    const complaints = await db.tblCustomerComplaint.findMany();
    const complaintsTotal = complaints.length;
    const complaintsResolved = complaints.filter((c) => c.status === "Selesai").length;
    const complaintsWithinSla = complaints.filter(
      (c) => c.status === "Selesai" && (c.responseTimeHours ?? 999) <= c.slaTargetHours,
    ).length;
    const slaPct = complaintsResolved
      ? Math.round((complaintsWithinSla / complaintsResolved) * 1000) / 10
      : 0;
    const complaintsOpen = complaints.filter((c) => c.status !== "Selesai").length;
    const complaintsByCat = groupCount(complaints.map((c) => c.category));

    // ---------- FR-03 Program Accreditation ----------
    const accreditations = await db.tblProgramAccreditation.findMany();
    const accTotal = accreditations.length;
    const now = Date.now();
    const accExpiring = accreditations.filter(
      (a) => a.expiryDate && a.expiryDate.getTime() - now <= 90 * 86400000 && a.expiryDate.getTime() - now >= 0,
    ).length;
    const accExpired = accreditations.filter(
      (a) => a.expiryDate && a.expiryDate.getTime() < now,
    ).length;
    const accActive = accTotal - accExpiring - accExpired;

    // ---------- FR-04 Instructor Certification ----------
    const instructors = await db.tblInstructorCertification.findMany();
    const instrTotal = instructors.length;
    const instrCertified = instructors.filter((i) => i.certLevel).length;
    const instrPct = instrTotal ? Math.round((instrCertified / instrTotal) * 1000) / 10 : 0;
    const instrByLevel = {
      SKM3: instructors.filter((i) => i.certLevel === "SKM3").length,
      DKM: instructors.filter((i) => i.certLevel === "DKM").length,
      DLKM: instructors.filter((i) => i.certLevel === "DLKM").length,
      Tiada: instructors.filter((i) => !i.certLevel).length,
    };

    // ---------- FR-05 Staff Training (40 hours) ----------
    const training = await db.tblStaffTraining.findMany({ where: { year: 2026 } });
    const trTotal = training.length;
    const trCompliant = training.filter((t) => t.hoursCompleted >= t.targetHours).length;
    const trPct = trTotal ? Math.round((trCompliant / trTotal) * 1000) / 10 : 0;
    const trAvgHours = trTotal
      ? Math.round((training.reduce((s, t) => s + t.hoursCompleted, 0) / trTotal) * 10) / 10
      : 0;
    const trAtRisk = training.filter((t) => t.hoursCompleted < t.targetHours * 0.6).length;

    // ---------- FR-06 Budget Mengurus ----------
    const budgetMengurus = await db.tblBudgetMengurus.findMany();
    const bmAllocation = budgetMengurus.reduce((s, b) => s + b.allocation, 0);
    const bmSpent = budgetMengurus.reduce((s, b) => s + b.spent, 0);
    const bmPct = bmAllocation ? Math.round((bmSpent / bmAllocation) * 1000) / 10 : 0;

    // ---------- FR-07 Budget Pembangunan ----------
    const budgetPembangunan = await db.tblBudgetPembangunan.findMany();
    const bpTotal = budgetPembangunan.length;
    const bpAllocation = budgetPembangunan.reduce((s, b) => s + b.allocation, 0);
    const bpSpent = budgetPembangunan.reduce((s, b) => s + b.spent, 0);
    const bpPct = bpAllocation ? Math.round((bpSpent / bpAllocation) * 1000) / 10 : 0;
    const bpAvgCompletion = bpTotal
      ? Math.round((budgetPembangunan.reduce((s, b) => s + b.completionPct, 0) / bpTotal) * 10) / 10
      : 0;
    const bpInProg = budgetPembangunan.filter((b) => b.status === "Dalam Pelaksanaan").length;

    // ---------- FR-08 Stock Verification ----------
    const stocks = await db.tblStockVerification.findMany();
    const stockTotal = stocks.length;
    const stockMatch = stocks.filter((s) => s.status === "Sepadan").length;
    const stockPct = stockTotal ? Math.round((stockMatch / stockTotal) * 1000) / 10 : 0;
    const stockVariance = stocks.filter((s) => Math.abs(s.variance) > 2).length;

    // ---------- FR-09 Short Course ----------
    const shortCourses = await db.tblShortCourseEnrolment.findMany();
    const scTotal = shortCourses.length;
    const scCap = shortCourses.reduce((s, c) => s + c.capacity, 0);
    const scPart = shortCourses.reduce((s, c) => s + c.participantCount, 0);
    const scPct = scCap ? Math.round((scPart / scCap) * 1000) / 10 : 0;
    const scRevenue = shortCourses.reduce((s, c) => s + c.revenue, 0);

    // ---------- FR-10 Graduates ----------
    const graduates = await db.tblGraduate.findMany();
    const gradTotal = graduates.length;
    const gradEmployed = graduates.filter((g) => g.employmentStatus === "Bekerja").length;
    const gradPct = gradTotal ? Math.round((gradEmployed / gradTotal) * 1000) / 10 : 0;
    const gradByStatus = groupCount(graduates.map((g) => g.employmentStatus || "Tidak Diketahui"));

    // ---------- FR-11 Trust Account ----------
    const trust = await db.tblTrustAccount.findMany({ orderBy: { transactionDate: "asc" } });
    const trustIncome = trust.filter((t) => t.transactionType === "Income").reduce((s, t) => s + t.amount, 0);
    const trustExpense = trust.filter((t) => t.transactionType === "Expense").reduce((s, t) => s + t.amount, 0);
    const trustBalance = trust.length ? trust[trust.length - 1].runningBalance : 0;
    const trustRatio = trustExpense ? Math.round((trustIncome / trustExpense) * 100) / 100 : 0;

    // ---------- FR-12 Mengurus Account ----------
    const mengurusAccts = await db.tblMengurusAccount.findMany();
    const maAllocation = mengurusAccts.reduce((s, a) => s + a.allocation, 0);
    const maSpent = mengurusAccts.reduce((s, a) => s + a.spent, 0);
    const maPct = maAllocation ? Math.round((maSpent / maAllocation) * 1000) / 10 : 0;
    const maOver = mengurusAccts.filter((a) => a.spent / a.allocation > 0.9).length;

    // ---------- FR-13 Asset Monitoring ----------
    const assets = await db.tblAssetMonitoring.findMany();
    const assetTotal = assets.length;
    const assetOverdue = assets.filter((a) => a.status === "Tertunggak").length;
    const assetPct = assetTotal ? Math.round(((assetTotal - assetOverdue) / assetTotal) * 1000) / 10 : 0;
    const assetByCond = {
      Baik: assets.filter((a) => a.condition === "Baik").length,
      "Perlu Baiki": assets.filter((a) => a.condition === "Perlu Baiki").length,
      Rosak: assets.filter((a) => a.condition === "Rosak").length,
    };

    // ---------- FR-14 Computer Inventory ----------
    const computers = await db.tblComputerInventory.findMany();
    const pcTotal = computers.length;
    const pcOk = computers.filter((c) => c.status === "Berfungsi").length;
    const pcPct = pcTotal ? Math.round((pcOk / pcTotal) * 1000) / 10 : 0;
    const pcOld = computers.filter((c) => (c.purchaseYear || 2024) <= 2020).length;

    const summary = {
      generatedAt: new Date().toISOString(),
      modules: {
        "FR-01": {
          code: "FR-01",
          title: "Enrolmen Sepenuh Masa",
          value: enrolTotalActual,
          unit: "pelajar",
          pct: enrolPct,
          trend: enrolTrend,
          target: enrolTotalTarget,
          subtitle: `${enrolTotalActual} / ${enrolTotalTarget} sasaran`,
          sessions: enrolRows.map((r) => ({
            session: r.sessionName,
            target: r._sum.targetIntake || 0,
            enrolled: r._sum.actualEnrolled || 0,
            pct: r._sum.targetIntake
              ? Math.round(((r._sum.actualEnrolled || 0) / r._sum.targetIntake) * 1000) / 10
              : 0,
          })),
        },
        "FR-02": {
          code: "FR-02",
          title: "Aduan Pelanggan",
          value: complaintsTotal,
          unit: "aduan",
          pct: slaPct,
          trend: complaintsOpen > 5 ? -Math.abs(complaintsOpen) : 0,
          subtitle: `${complaintsOpen} belum selesai · SLA ${slaPct}%`,
          byCategory: complaintsByCat,
        },
        "FR-03": {
          code: "FR-03",
          title: "Pentauliahan Program",
          value: accActive,
          unit: "aktif",
          pct: accTotal ? Math.round((accActive / accTotal) * 1000) / 10 : 0,
          trend: -(accExpiring + accExpired),
          subtitle: `${accExpiring} akan luput · ${accExpired} luput`,
          breakdown: { aktif: accActive, akanLuput: accExpiring, luput: accExpired },
        },
        "FR-04": {
          code: "FR-04",
          title: "Pengajar DV Bersijil",
          value: instrCertified,
          unit: "pengajar",
          pct: instrPct,
          trend: instrByLevel.Tiada ? -instrByLevel.Tiada : 0,
          subtitle: `${instrByLevel.Tiada} belum bersijil`,
          breakdown: instrByLevel,
        },
        "FR-05": {
          code: "FR-05",
          title: "Latihan Kakitangan 40j",
          value: trCompliant,
          unit: "patuh",
          pct: trPct,
          trend: -trAtRisk,
          subtitle: `Purata ${trAvgHours}j · ${trAtRisk} berisiko`,
        },
        "FR-06": {
          code: "FR-06",
          title: "Bajet Mengurus",
          value: bmSpent,
          unit: "RM",
          pct: bmPct,
          trend: bmPct > 80 ? -5 : 0,
          subtitle: `RM ${fmt(bmSpent)} / ${fmt(bmAllocation)}`,
          isCurrency: true,
        },
        "FR-07": {
          code: "FR-07",
          title: "Bajet Pembangunan",
          value: bpInProg,
          unit: "projek",
          pct: bpPct,
          trend: bpAvgCompletion - 100,
          subtitle: `Siap ${bpAvgCompletion}% · RM ${fmt(bpSpent)}`,
        },
        "FR-08": {
          code: "FR-08",
          title: "Verifikasi Stok",
          value: stockMatch,
          unit: "sepadan",
          pct: stockPct,
          trend: -stockVariance,
          subtitle: `${stockVariance} percanggahan`,
        },
        "FR-09": {
          code: "FR-09",
          title: "Kursus Jangka Pendek",
          value: scPart,
          unit: "peserta",
          pct: scPct,
          trend: scRevenue > 0 ? Math.round(scRevenue / 1000) : 0,
          subtitle: `RM ${fmt(scRevenue)} hasil`,
          isCurrency: true,
        },
        "FR-10": {
          code: "FR-10",
          title: "Graduan",
          value: gradTotal,
          unit: "graduan",
          pct: gradPct,
          trend: gradEmployed,
          subtitle: `${gradPct}% kebolehpasaran`,
          byStatus: gradByStatus,
        },
        "FR-11": {
          code: "FR-11",
          title: "Akaun Amanah",
          value: trustBalance,
          unit: "RM",
          pct: trustRatio > 1 ? 100 : Math.round(trustRatio * 100),
          trend: trustRatio > 1 ? 1 : -1,
          subtitle: `Nisbah ${trustRatio} · Baki RM ${fmt(trustBalance)}`,
          isCurrency: true,
          income: trustIncome,
          expense: trustExpense,
        },
        "FR-12": {
          code: "FR-12",
          title: "Akaun Mengurus",
          value: maSpent,
          unit: "RM",
          pct: maPct,
          trend: -maOver,
          subtitle: `${maOver} akaun > 90%`,
          isCurrency: true,
        },
        "FR-13": {
          code: "FR-13",
          title: "Pemantauan Aset",
          value: assetTotal - assetOverdue,
          unit: "terkini",
          pct: assetPct,
          trend: -assetOverdue,
          subtitle: `${assetOverdue} tertunggak semakan`,
          breakdown: assetByCond,
        },
        "FR-14": {
          code: "FR-14",
          title: "Inventori Komputer",
          value: pcOk,
          unit: "unit",
          pct: pcPct,
          trend: -pcOld,
          subtitle: `${pcOld} unit > 5 tahun`,
        },
      },
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("[/api/dashboard] error", err);
    return NextResponse.json(
      { error: "Gagal memuatkan ringkasan dashboard", detail: String(err) },
      { status: 500 },
    );
  }
}

function groupCount(arr: string[]): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
}
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "j";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}
