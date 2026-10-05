"use server";

import { prisma } from "@/lib/prisma";

export async function getLeaderboardData() {
  try {
    // Ambil data semua Satgas beserta riwayat evaluasinya
    const satgasList = await prisma.user.findMany({
      where: { role: "SATGAS" },
      include: {
        cluster: true,
        satgasAssessments: {
          select: {
            score: true,
            createdAt: true,
          },
        },
      },
    });

    // Olah data skor & akumulasi bintang
    const leaderboard = satgasList.map((satgas) => {
      const totalEvaluasi = satgas.satgasAssessments.length;
      const totalSkor = satgas.satgasAssessments.reduce(
        (acc, curr) => acc + (curr.score || 0),
        0
      );
      const rataRata = totalEvaluasi > 0 ? totalSkor / totalEvaluasi : 0;

      // Logika Bintang Emas (contoh: setiap kelipatan nilai rata-rata >= 85 mendapat bintang)
      const goldStars = rataRata >= 85 ? Math.floor(rataRata / 10) - 7 : 0;

      return {
        id: satgas.id,
        name: satgas.name,
        nip: satgas.nip,
        level: satgas.level,
        cluster: satgas.cluster?.name || "Tanpa Klaster",
        wilayah: satgas.cluster?.description || "-",
        totalEvaluasi,
        rataRataScore: Math.round(rataRata * 10) / 10,
        goldStars: goldStars > 0 ? goldStars : 0,
      };
    });

    // Urutkan berdasarkan Rata-Rata Skor Tertinggi
    leaderboard.sort((a, b) => b.rataRataScore - a.rataRataScore);

    return leaderboard;
  } catch (error) {
    console.error("Leaderboard Data Error:", error);
    return [];
  }
}