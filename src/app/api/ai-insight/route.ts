import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/ai-insight
// Body: { question?: string }
// Generates narrative analytics in Bahasa Malaysia from the dashboard KPI summary.
// Uses z.ai GLM 5.2 as the "AI Insight Generator" (PRD section 3.4).
// API key is kept server-side only (never exposed to the client).
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const question: string | undefined = body?.question?.trim();

    // Build a compact KPI digest to send to GLM (no raw sensitive data).
    const digest = await buildDigest();

    const zai = await ZAI.create();

    const systemPrompt = `Anda adalah "AI Insight Generator" rasmi untuk Sistem Dashboard Pemantauan Bersepadu Jabatan Tenaga Manusia (JTM), Kementerian Sumber Manusia Malaysia.

Tugas anda:
- Menganalisis ringkasan KPI dashboard operasi ILP/IKM yang diberikan.
- Menjana naratif analitik yang ringkas, tajam dan berorientasikan tindakan dalam BAHASA MALAYSIA.
- Menyentuh tren, anomali, risiko kritikal serta cadangan penambahbaikan.
- Menggunakan format Markdown yang kemas dengan tajuk kecil (##) dan bullet point (-).
- Sentiasa merujuk nombor sebenar dari data.

Sekiranya pengguna bertanya soalan bahasa semula jadi, jawab berdasarkan data yang diberikan. Jika data tidak mencukupi, nyatakan dengan jujur.`;

    const userContent = question
      ? `Berikut adalah ringkasan KPI dashboard JTM terkini (dipendekkan):\n\n${digest}\n\nSoalan pengguna: ${question}\n\nSila jawab dalam Bahasa Malaysia berdasarkan data di atas.`
      : `Berikut adalah ringkasan KPI dashboard JTM terkini (dipendekkan):\n\n${digest}\n\nTolong hasilkan ringkasan eksekutif analitik dalam Bahasa Malaysia yang merangkumi:\n1. Perkara paling positif (2-3 mata)\n2. Perkara kritikal yang perlu tindakan segera (2-3 mata)\n3. Cadangan strategik ringkas (1-2 mata)\n\nGunakan format Markdown dengan tajuk ## dan bullet point.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      thinking: { type: "disabled" },
    });

    const content = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      ok: true,
      insight: content,
      generatedAt: new Date().toISOString(),
      question: question || null,
    });
  } catch (err) {
    console.error("[/api/ai-insight] error", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Gagal menjana insight AI",
        detail: String(err),
      },
      { status: 500 },
    );
  }
}

// Build a compact textual digest of current dashboard state.
async function buildDigest(): Promise<string> {
  const lines: string[] = [];

  const enrol = await db.tblEnrolmentFulltime.groupBy({
    by: ["sessionName"],
    _sum: { targetIntake: true, actualEnrolled: true },
    orderBy: { sessionName: "asc" },
  });
  const et = enrol.reduce((s, r) => s + (r._sum.targetIntake || 0), 0);
  const ea = enrol.reduce((s, r) => s + (r._sum.actualEnrolled || 0), 0);
  lines.push(
    `FR-01 Enrolmen: Sasaran ${et}, Sebenar ${ea} (${pct(ea, et)}%). Sesi terkini: ${enrol.at(-1)?.sessionName ?? "-"}.`,
  );

  const comp = await db.tblCustomerComplaint.findMany();
  const compResolved = comp.filter((c) => c.status === "Selesai");
  const withinSla = compResolved.filter(
    (c) => (c.responseTimeHours ?? 999) <= c.slaTargetHours,
  ).length;
  lines.push(
    `FR-02 Aduan: Jumlah ${comp.length}, Selesai ${compResolved.length}, SLA patuh ${pct(withinSla, compResolved.length)}%.`,
  );

  const acc = await db.tblProgramAccreditation.findMany();
  const accExp = acc.filter(
    (a) => a.expiryDate && a.expiryDate.getTime() - Date.now() <= 90 * 86400000 && a.expiryDate.getTime() >= Date.now(),
  ).length;
  const accLuput = acc.filter((a) => a.expiryDate && a.expiryDate.getTime() < Date.now()).length;
  lines.push(`FR-03 Pentauliahan: ${acc.length} program, ${accExp} akan luput 90 hari, ${accLuput} telah luput.`);

  const instr = await db.tblInstructorCertification.findMany();
  const instrCert = instr.filter((i) => i.certLevel).length;
  lines.push(`FR-04 Pengajar DV: ${instrCert}/${instr.length} bersijil (${pct(instrCert, instr.length)}%).`);

  const train = await db.tblStaffTraining.findMany({ where: { year: 2026 } });
  const trainOk = train.filter((t) => t.hoursCompleted >= t.targetHours).length;
  lines.push(`FR-05 Latihan 40j: ${trainOk}/${train.length} kakitangan patuh.`);

  const bm = await db.tblBudgetMengurus.findMany();
  const bmA = bm.reduce((s, b) => s + b.allocation, 0);
  const bmS = bm.reduce((s, b) => s + b.spent, 0);
  lines.push(`FR-06 Bajet Mengurus: Peruntukan RM${bmA.toLocaleString()}, Belanja RM${bmS.toLocaleString()} (${pct(bmS, bmA)}%).`);

  const bp = await db.tblBudgetPembangunan.findMany();
  const bpAvg = bp.length ? bp.reduce((s, b) => s + b.completionPct, 0) / bp.length : 0;
  lines.push(`FR-07 Bajet Pembangunan: ${bp.length} projek, purata siap ${bpAvg.toFixed(1)}%.`);

  const stock = await db.tblStockVerification.findMany();
  const stockOk = stock.filter((s) => s.status === "Sepadan").length;
  lines.push(`FR-08 Verifikasi Stok: ${stockOk}/${stock.length} sepadan (${pct(stockOk, stock.length)}%).`);

  const sc = await db.tblShortCourseEnrolment.findMany();
  const scRev = sc.reduce((s, c) => s + c.revenue, 0);
  const scPart = sc.reduce((s, c) => s + c.participantCount, 0);
  lines.push(`FR-09 Kursus Pendek: ${sc.length} kursus, ${scPart} peserta, hasil RM${scRev.toLocaleString()}.`);

  const grad = await db.tblGraduate.findMany();
  const gradEmp = grad.filter((g) => g.employmentStatus === "Bekerja").length;
  lines.push(`FR-10 Graduan: ${grad.length} graduan, ${gradEmp} bekerja (${pct(gradEmp, grad.length)}% kebolehpasaran).`);

  const trust = await db.tblTrustAccount.findMany();
  const tIn = trust.filter((t) => t.transactionType === "Income").reduce((s, t) => s + t.amount, 0);
  const tOut = trust.filter((t) => t.transactionType === "Expense").reduce((s, t) => s + t.amount, 0);
  const tBal = trust.length ? trust[trust.length - 1].runningBalance : 0;
  lines.push(`FR-11 Akaun Amanah: Pendapatan RM${tIn.toLocaleString()}, Perbelanjaan RM${tOut.toLocaleString()}, Baki RM${tBal.toLocaleString()}.`);

  const ma = await db.tblMengurusAccount.findMany();
  const maA = ma.reduce((s, a) => s + a.allocation, 0);
  const maS = ma.reduce((s, a) => s + a.spent, 0);
  lines.push(`FR-12 Akaun Mengurus: ${ma.length} kod akaun, perbelanjaan ${pct(maS, maA)}%.`);

  const assets = await db.tblAssetMonitoring.findMany();
  const assetOverdue = assets.filter((a) => a.status === "Tertunggak").length;
  lines.push(`FR-13 Aset: ${assets.length} aset, ${assetOverdue} tertunggak semakan.`);

  const pcs = await db.tblComputerInventory.findMany();
  const pcsOk = pcs.filter((c) => c.status === "Berfungsi").length;
  lines.push(`FR-14 Komputer: ${pcs.length} unit, ${pcsOk} berfungsi (${pct(pcsOk, pcs.length)}%).`);

  return lines.join("\n");
}

function pct(n: number, d: number): string {
  if (!d) return "0";
  return `${Math.round((n / d) * 1000) / 10}%`;
}
