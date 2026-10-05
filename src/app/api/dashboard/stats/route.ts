import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentYear = 2026;
    const currentMonth = new Date().getMonth() + 1;

    const [totalSatgas, totalAssessments, currentMonthAssessments, allAssessments, topSatgasList, allUsersWithAssessments] =
      await Promise.all([
        prisma.user.count({ where: { role: "SATGAS" } }),
        prisma.assessment.count(),
        prisma.assessment.count({
          where: { periodMonth: currentMonth, periodYear: currentYear },
        }),
        prisma.assessment.findMany({
          select: { totalGold: true, totalSilver: true, periodMonth: true },
        }),
        prisma.user.findMany({
          where: { role: "SATGAS" },
          select: {
            id: true,
            name: true,
            nip: true,
            level: true,
            cluster: { select: { name: true } },
            assessments: {
              select: { totalSilver: true },
            },
          },
        }),
        prisma.user.findMany({
          where: { role: "SATGAS" },
          select: {
            cluster: { select: { wilayah: true } },
            assessments: { select: { totalSilver: true, totalGold: true } },
          },
        }),
      ]);

    // 1. Hitung total Bintang Emas secara nasional
    const totalGoldEarned = allAssessments.reduce((acc, curr) => acc + curr.totalGold, 0);

    // 2. Leaderboard Top 3
    const satgasRankings = topSatgasList
      .map((satgas) => {
        const netSilver = Math.max(
          0,
          satgas.assessments.reduce((acc, curr) => acc + curr.totalSilver, 0)
        );
        const gold = Math.floor(netSilver / 5);
        const silver = netSilver % 5;
        return {
          id: satgas.id,
          name: satgas.name,
          nip: satgas.nip,
          level: satgas.level,
          clusterName: satgas.cluster?.name || "-",
          gold,
          silver,
        };
      })
      .sort((a, b) => b.gold - a.gold || b.silver - a.silver)
      .slice(0, 3);

    // 3. Data Grafik 1: Performa per Wilayah
    const wilayahStats: Record<string, { totalGold: number; totalSilver: number }> = {
      BARAT: { totalGold: 0, totalSilver: 0 },
      TIMUR: { totalGold: 0, totalSilver: 0 },
      CENTRAL: { totalGold: 0, totalSilver: 0 },
    };

    allUsersWithAssessments.forEach((u) => {
      const wil = u.cluster?.wilayah || "BARAT";
      const userSilver = Math.max(0, u.assessments.reduce((acc, curr) => acc + curr.totalSilver, 0));
      const userGold = Math.floor(userSilver / 5);

      if (wilayahStats[wil]) {
        wilayahStats[wil].totalGold += userGold;
        wilayahStats[wil].totalSilver += userSilver;
      }
    });

    const regionChartData = [
      { name: "Barat", BintangEmas: wilayahStats.BARAT.totalGold, TotalSilver: wilayahStats.BARAT.totalSilver },
      { name: "Timur", BintangEmas: wilayahStats.TIMUR.totalGold, TotalSilver: wilayahStats.TIMUR.totalSilver },
      { name: "Central", BintangEmas: wilayahStats.CENTRAL.totalGold, TotalSilver: wilayahStats.CENTRAL.totalSilver },
    ];

    // 4. Data Grafik 2: Tren Evaluasi Bulanan
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const count = allAssessments.filter((a) => a.periodMonth === monthNum).length;
      return {
        month: monthNames[i],
        Evaluasi: count,
      };
    });

    return NextResponse.json({
      totalSatgas,
      totalAssessments,
      currentMonthAssessments,
      totalGoldEarned,
      topSatgasList: satgasRankings,
      regionChartData,
      monthlyChartData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil statistik dashboard" }, { status: 500 });
  }
}