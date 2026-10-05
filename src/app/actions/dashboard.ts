"use server";

import { prisma } from "@/lib/prisma";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

export async function getDashboardStats() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [totalSatgas, evaluasiBulanIni, totalAssessments, goldSum, yearAssessments, satgasList] =
      await Promise.all([
        prisma.user.count({ where: { role: "SATGAS" } }),
        prisma.assessment.count({ where: { periodMonth: month, periodYear: year, isDraft: false } }),
        prisma.assessment.count({ where: { isDraft: false } }),
        prisma.assessment.aggregate({ _sum: { totalGold: true }, where: { isDraft: false } }),
        prisma.assessment.findMany({
          where: { periodYear: year, isDraft: false },
          select: {
            periodMonth: true,
            totalGold: true,
            satgas: { select: { cluster: { select: { wilayah: true } } } },
          },
        }),
        prisma.user.findMany({
          where: { role: "SATGAS" },
          include: {
            cluster: true,
            assessments: { where: { isDraft: false }, select: { totalGold: true } },
          },
        }),
      ]);

    // Gold per wilayah (tahun ini)
    const region: Record<string, number> = { BARAT: 0, TIMUR: 0, CENTRAL: 0 };
    // Jumlah evaluasi per bulan (tahun ini)
    const monthly = new Array(12).fill(0);

    for (const a of yearAssessments) {
      const w = a.satgas.cluster?.wilayah;
      if (w) region[w] += a.totalGold;
      monthly[a.periodMonth - 1] += 1;
    }

    const starPerRegionData = [
      { name: "Barat", gold: region.BARAT },
      { name: "Timur", gold: region.TIMUR },
      { name: "Central", gold: region.CENTRAL },
    ];

    const monthlyTrendData = MONTHS.map((m, i) => ({ month: m, count: monthly[i] }));

    // 3 Satgas dengan total gold terbanyak
    const topSatgasList = satgasList
      .map(({ assessments, password, ...s }) => ({
        ...s,
        totalGold: assessments.reduce((sum, a) => sum + a.totalGold, 0),
      }))
      .sort((a, b) => b.totalGold - a.totalGold)
      .slice(0, 3);

    return {
      totalSatgas,
      evaluasiBulanIni,
      totalAssessments,
      totalGoldStars: goldSum._sum.totalGold ?? 0,
      starPerRegionData,
      monthlyTrendData,
      topSatgasList,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      totalSatgas: 0,
      evaluasiBulanIni: 0,
      totalAssessments: 0,
      totalGoldStars: 0,
      starPerRegionData: [],
      monthlyTrendData: [],
      topSatgasList: [],
    };
  }
}
