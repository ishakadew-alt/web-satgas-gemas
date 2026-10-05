import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periodMonth = searchParams.get("periodMonth");
    const periodYear = searchParams.get("periodYear");
    const clusterId = searchParams.get("clusterId");
    const wilayah = searchParams.get("wilayah");

    const whereUser: any = { role: "SATGAS" };
    if (clusterId) {
      whereUser.clusterId = clusterId;
    } else if (wilayah) {
      whereUser.cluster = { wilayah: wilayah as any };
    }

    // Ambil semua Satgas beserta data penilaiannya
    const satgasList = await prisma.user.findMany({
      where: whereUser,
      select: {
        id: true,
        name: true,
        nip: true,
        level: true,
        cluster: {
          select: { name: true, wilayah: true },
        },
        assessments: {
          where: {
            ...(periodMonth ? { periodMonth: Number(periodMonth) } : {}),
            ...(periodYear ? { periodYear: Number(periodYear) } : {}),
          },
          select: {
            id: true,
            periodMonth: true,
            periodYear: true,
            totalSilver: true,
            totalGold: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Proses kalkulasi total akumulasi bintang per Satgas
    const summaryData = satgasList.map((satgas) => {
      const totalSilverAll = satgas.assessments.reduce((acc, curr) => acc + curr.totalSilver, 0);
      const netSilver = Math.max(0, totalSilverAll);
      const totalGold = Math.floor(netSilver / 5);
      const sisaSilver = netSilver % 5;

      return {
        id: satgas.id,
        name: satgas.name,
        nip: satgas.nip,
        level: satgas.level,
        clusterName: satgas.cluster?.name || "Unassigned",
        wilayah: satgas.cluster?.wilayah || "-",
        totalEvaluations: satgas.assessments.length,
        totalSilver: netSilver,
        totalGold,
        sisaSilver,
        assessments: satgas.assessments,
      };
    });

    // Urutkan berdasarkan Bintang Emas terbanyak (Leaderboard)
    summaryData.sort((a, b) => b.totalGold - a.totalGold || b.sisaSilver - a.sisaSilver);

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data rekapitulasi" }, { status: 500 });
  }
}