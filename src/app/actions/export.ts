"use server";

import { prisma } from "@/lib/prisma";

export async function getExportData() {
  try {
    const satgasList = await prisma.user.findMany({
      where: { role: "SATGAS" },
      include: {
        cluster: true,
        satgasAssessments: {
          select: { score: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Format data untuk ekspor CSV
    const rows = satgasList.map((satgas, index) => {
      const totalEvaluasi = satgas.satgasAssessments.length;
      const totalSkor = satgas.satgasAssessments.reduce(
        (acc, curr) => acc + (curr.score || 0),
        0
      );
      const rataRata = totalEvaluasi > 0 ? totalSkor / totalEvaluasi : 0;
      const goldStars = rataRata >= 85 ? Math.floor(rataRata / 10) - 7 : 0;

      return {
        No: index + 1,
        NIP: satgas.nip,
        Nama: satgas.name,
        Level: satgas.level ? satgas.level.replace("_", " ") : "-",
        Klaster: satgas.cluster?.name || "Tanpa Klaster",
        TotalEvaluasi: totalEvaluasi,
        RataRataSkor: Math.round(rataRata * 10) / 10,
        BintangEmas: goldStars > 0 ? goldStars : 0,
      };
    });

    return rows;
  } catch (error) {
    console.error("Export Data Error:", error);
    return [];
  }
}