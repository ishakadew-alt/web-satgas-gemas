"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Nilai bintang silver per rating (sesuai komentar di schema: 0 - 4)
const RATING_SILVER: Record<string, number> = {
  NO_OPINION: 0,
  POOR: 1,
  FAIR: 2,
  GOOD: 3,
  EXCELLENT: 4,
};

// Aturan konversi: berapa silver = 1 gold (SILAKAN SESUAIKAN)
const SILVER_PER_GOLD = 10;

export interface AspectRatingInput {
  aspectId: string;
  // Aspek RATING: "NO_OPINION" | "POOR" | "FAIR" | "GOOD" | "EXCELLENT"
  // Aspek PENALTY: "VIOLATED" jika melanggar, null jika tidak
  rating?: string | null;
}

export interface CreateAssessmentInput {
  satgasId: string;
  facilitatorId: string;
  periodMonth: number; // 1 - 12
  periodYear: number; // contoh: 2026
  isDraft?: boolean;
  details: AspectRatingInput[];
}

export async function submitAssessment(data: CreateAssessmentInput) {
  try {
    if (!data.satgasId || !data.facilitatorId || data.details.length === 0) {
      return { success: false, error: "Data Satgas, fasilitator, dan penilaian wajib diisi." };
    }
    if (data.periodMonth < 1 || data.periodMonth > 12) {
      return { success: false, error: "Bulan periode tidak valid." };
    }

    // Ambil data aspek dari database agar perhitungan tidak bisa dimanipulasi dari browser
    const aspects = await prisma.aspect.findMany({
      where: { id: { in: data.details.map((d) => d.aspectId) } },
    });
    const aspectMap = new Map(aspects.map((a) => [a.id, a]));

    if (aspectMap.size !== new Set(data.details.map((d) => d.aspectId)).size) {
      return { success: false, error: "Ada aspek penilaian yang tidak ditemukan." };
    }

    const detailRows = data.details.map((d) => {
      const aspect = aspectMap.get(d.aspectId)!;
      let silverEarned = 0;

      if (aspect.type === "PENALTY") {
        if (d.rating === "VIOLATED") silverEarned = -Math.abs(aspect.deduction);
      } else {
        silverEarned = RATING_SILVER[d.rating ?? "NO_OPINION"] ?? 0;
      }

      return { aspectId: d.aspectId, rating: d.rating ?? null, silverEarned };
    });

    const totalSilver = Math.max(0, detailRows.reduce((sum, r) => sum + r.silverEarned, 0));
    const totalGold = Math.floor(totalSilver / SILVER_PER_GOLD);

    // Satu Satgas hanya punya satu penilaian per bulan: jika sudah ada, diperbarui
    const existing = await prisma.assessment.findFirst({
      where: {
        satgasId: data.satgasId,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
      },
    });

    const assessment = existing
      ? await prisma.assessment.update({
          where: { id: existing.id },
          data: {
            facilitatorId: data.facilitatorId,
            totalSilver,
            totalGold,
            isDraft: data.isDraft ?? false,
            details: { deleteMany: {}, create: detailRows },
          },
        })
      : await prisma.assessment.create({
          data: {
            satgasId: data.satgasId,
            facilitatorId: data.facilitatorId,
            periodMonth: data.periodMonth,
            periodYear: data.periodYear,
            totalSilver,
            totalGold,
            isDraft: data.isDraft ?? false,
            details: { create: detailRows },
          },
        });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/leaderboard");
    revalidatePath("/dashboard/rekapitulasi");

    return { success: true, data: assessment };
  } catch (error: any) {
    console.error("Error submitAssessment:", error);
    return { success: false, error: error.message || "Gagal menyimpan penilaian." };
  }
}

// Ambil semua aspek, diurutkan per kode kategori (A, B, C, ...)
export async function getActiveAspects() {
  try {
    return await prisma.aspect.findMany({
      include: { category: true },
      orderBy: [{ category: { code: "asc" } }, { createdAt: "asc" }],
    });
  } catch (error) {
    console.error("Error getActiveAspects:", error);
    return [];
  }
}

// Hapus penilaian (detail ikut terhapus otomatis karena onDelete: Cascade)
export async function deleteAssessment(id: string) {
  try {
    await prisma.assessment.delete({ where: { id } });
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/leaderboard");
    revalidatePath("/dashboard/rekapitulasi");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleteAssessment:", error);
    return { success: false, error: error.message || "Gagal menghapus penilaian." };
  }
}

// Daftar semua penilaian untuk tabel rekap
export async function getAssessmentsData() {
  try {
    return await prisma.assessment.findMany({
      include: {
        satgas: { select: { id: true, name: true, nip: true, level: true, cluster: true } },
        facilitator: { select: { id: true, name: true } },
      },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Error getAssessmentsData:", error);
    return [];
  }
}
