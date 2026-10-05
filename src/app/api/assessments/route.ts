import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil daftar Satgas beserta Status Penilaian (Belum, Draft, Sudah Dinilai)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clusterId = searchParams.get("clusterId");
    const wilayah = searchParams.get("wilayah");
    const periodMonth = Number(searchParams.get("periodMonth") || new Date().getMonth() + 1);
    const periodYear = Number(searchParams.get("periodYear") || 2026);

    const whereCondition: any = { role: "SATGAS" };
    if (clusterId) {
      whereCondition.clusterId = clusterId;
    } else if (wilayah) {
      whereCondition.cluster = { wilayah };
    }

    const [satgasList, categories, clusters, existingAssessments] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: { id: true, name: true, nip: true, level: true, cluster: true },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        include: { aspects: true },
        orderBy: { code: "asc" },
      }),
      prisma.cluster.findMany({ orderBy: { name: "asc" } }),
      prisma.assessment.findMany({
        where: { periodMonth, periodYear },
        include: { details: true },
      }),
    ]);

    // Gabungkan status penilaian ke setiap Satgas
    const formattedSatgasList = satgasList.map((satgas) => {
      const assessment = existingAssessments.find((a) => a.satgasId === satgas.id);
      let status = "NOT_ASSESSED"; // Belum Dinilai

      if (assessment) {
        status = assessment.isDraft ? "DRAFT" : "SUBMITTED"; // Draft / Sudah Dinilai
      }

      return {
        ...satgas,
        assessmentStatus: status,
        existingAssessment: assessment || null,
      };
    });

    return NextResponse.json({
      satgasList: formattedSatgasList,
      categories,
      clusters,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data form penilaian" }, { status: 500 });
  }
}

// POST: Simpan Evaluasi / Draft Penilaian
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { satgasId, facilitatorId, periodMonth, periodYear, details, isDraft } = body;

    if (!satgasId) {
      return NextResponse.json({ error: "Satgas harus dipilih" }, { status: 400 });
    }

    // Validasi & Fallback Facilitator ID
    let validFacilitatorId = facilitatorId;
    const existingFacilitator = await prisma.user.findUnique({
      where: { id: facilitatorId || "" },
    });

    if (!existingFacilitator) {
      const defaultFacilitator = await prisma.user.findFirst({ where: { role: "FACILITATOR" } });
      if (defaultFacilitator) validFacilitatorId = defaultFacilitator.id;
      else {
        const anyUser = await prisma.user.findFirst();
        if (anyUser) validFacilitatorId = anyUser.id;
        else return NextResponse.json({ error: "Fasilitator tidak ditemukan" }, { status: 400 });
      }
    }

    // Filter aspek yang diisi
    const activeDetails = (details || []).filter((item: any) => {
      if (item.type === "PENALTY") return item.selected === true;
      return item.rating && item.rating !== "NO_OPINION";
    });

    // Hitung Poin
    let totalSilver = 0;
    const assessmentDetailsData = activeDetails.map((item: any) => {
      let silverEarned = 0;
      if (item.type === "PENALTY") {
        silverEarned = -Math.abs(item.deduction || 2);
      } else {
        switch (item.rating) {
          case "EXCELLENT": silverEarned = 4; break;
          case "GOOD": silverEarned = 3; break;
          case "FAIR": silverEarned = 2; break;
          case "POOR": silverEarned = 1; break;
          default: silverEarned = 0; break;
        }
      }

      totalSilver += silverEarned;
      return {
        aspectId: item.aspectId,
        rating: item.rating || null,
        silverEarned,
      };
    });

    const netSilver = Math.max(0, totalSilver);
    const totalGold = Math.floor(netSilver / 5);

    // Cek apakah sudah pernah ada record penilaian di bulan/tahun ini
    const existing = await prisma.assessment.findFirst({
      where: { satgasId, periodMonth: Number(periodMonth), periodYear: Number(periodYear) },
    });

    let assessment;
    if (existing) {
      // Hapus rincian detail lama, lalu update
      await prisma.assessmentDetail.deleteMany({ where: { assessmentId: existing.id } });

      assessment = await prisma.assessment.update({
        where: { id: existing.id },
        data: {
          facilitatorId: validFacilitatorId,
          totalSilver: netSilver,
          totalGold,
          isDraft: Boolean(isDraft),
          details: { create: assessmentDetailsData },
        },
        include: { details: true },
      });
    } else {
      // Buat Penilaian Baru
      assessment = await prisma.assessment.create({
        data: {
          satgasId,
          facilitatorId: validFacilitatorId,
          periodMonth: Number(periodMonth),
          periodYear: Number(periodYear),
          totalSilver: netSilver,
          totalGold,
          isDraft: Boolean(isDraft),
          details: { create: assessmentDetailsData },
        },
        include: { details: true },
      });
    }

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error("Error Saving Assessment:", error);
    return NextResponse.json({ error: error?.message || "Gagal menyimpan penilaian" }, { status: 500 });
  }
}