import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil seluruh Satgas beserta riwayat nilai yang mereka terima
    const satgasUsers = await prisma.user.findMany({
      where: { role: "SATGAS" },
      include: {
        nilaiDiterima: {
          include: {
            facilitator: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    // Hitung rata-rata nilai untuk tiap Satgas
    const leaderboard = satgasUsers.map((satgas) => {
      const totalScore = satgas.nilaiDiterima.reduce((sum, item) => sum + item.score, 0);
      const count = satgas.nilaiDiterima.length;
      const avgScore = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;

      return {
        id: satgas.id,
        name: satgas.name,
        nip: satgas.nip,
        level: satgas.level,
        avgScore,
        totalAssessments: count,
        history: satgas.nilaiDiterima
      };
    });

    // Urutkan dari nilai rata-rata tertinggi ke terendah
    leaderboard.sort((a, b) => b.avgScore - a.avgScore);

    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data leaderboard" }, { status: 500 });
  }
}