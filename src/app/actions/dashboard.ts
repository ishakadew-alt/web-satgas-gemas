"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSatgas,
      evaluasiBulanIni,
      totalAssessments,
      topSatgasList,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "SATGAS" } }),
      prisma.assessment.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.assessment.count(),
      prisma.user.findMany({
        where: { role: "SATGAS" },
        take: 3,
        include: { cluster: true },
      }),
    ]);

    // Data simulasi grafik wilayah (bisa dihubungkan ke DB)
    const starPerRegionData = [
      { name: "Barat", gold: 0 },
      { name: "Timur", gold: 0 },
      { name: "Central", gold: 0 },
    ];

    // Data simulasi tren bulanan
    const monthlyTrendData = [
      { month: "Jan", count: 0 },
      { month: "Feb", count: 0 },
      { month: "Mar", count: 0 },
      { month: "Apr", count: 0 },
      { month: "Mei", count: 0 },
      { month: "Jun", count: 0 },
      { month: "Jul", count: 0 },
      { month: "Agt", count: 0 },
      { month: "Sep", count: 0 },
      { month: "Okt", count: 0 },
      { month: "Nov", count: 0 },
      { month: "Des", count: 0 },
    ];

    return {
      totalSatgas,
      evaluasiBulanIni,
      totalAssessments,
      totalGoldStars: 0,
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