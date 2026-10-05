"use server";

import { prisma } from "@/lib/prisma";

export async function getLeaderboardData() {
  try {
    const satgasList = await prisma.user.findMany({
      where: { role: "SATGAS" },
      include: {
        cluster: true,
        assessments: {
          where: { isDraft: false },
          select: { totalSilver: true, totalGold: true },
        },
      },
    });

    const leaderboard = satgasList.map((satgas) => {
      const totalEvaluasi = satgas.assessments.length;
      const totalSilver = satgas.assessments.reduce((acc, a) => acc + a.totalSilver, 0);
      const goldStars = satgas.assessments.reduce((acc, a) => acc + a.totalGold, 0);
      const rataRata = totalEvaluasi > 0 ? totalSilver / totalEvaluasi : 0;

      return {
        id: satgas.id,
        name: satgas.name,
        nip: satgas.nip,
        level: satgas.level,
        cluster: satgas.cluster?.name || "Tanpa Klaster",
        wilayah: satgas.cluster?.wilayah || "-",
        totalEvaluasi,
        totalSilver,
        rataRataScore: Math.round(rataRata * 10) / 10, // rata-rata silver per evaluasi
        goldStars,
      };
    });

    // Urutkan: gold terbanyak dulu, jika sama pakai total silver
    leaderboard.sort((a, b) => b.goldStars - a.goldStars || b.totalSilver - a.totalSilver);

    return leaderboard;
  } catch (error) {
    console.error("Leaderboard Data Error:", error);
    return [];
  }
}
