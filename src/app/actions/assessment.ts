"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface AspectScoreInput {
  aspectId: string;
  score: number;
  notes?: string;
}

export interface CreateAssessmentInput {
  satgasId: string;
  facilitatorId: string;
  evalPeriod: string; // misal: "Minggu 1 - Oktober 2026"
  generalNotes?: string;
  aspectScores: AspectScoreInput[];
}

export async function submitAssessment(data: CreateAssessmentInput) {
  try {
    if (!data.satgasId || data.aspectScores.length === 0) {
      return { success: false, error: "Data Satgas dan Skor Aspek wajib diisi." };
    }

    // 1. Hitung Rata-Rata Skor Keseluruhan
    const totalScoreSum = data.aspectScores.reduce((sum, item) => sum + item.score, 0);
    const finalScore = Math.round(totalScoreSum / data.aspectScores.length);

    // 2. Hitung Perolehan Bintang (Gold >= 85, Silver >= 70)
    let goldStarEarned = 0;
    let silverStarEarned = 0;

    if (finalScore >= 85) {
      goldStarEarned = 1;
    } else if (finalScore >= 70) {
      silverStarEarned = 1;
    }

    // 3. Simpan Transaksi Penilaian ke Database
    const assessment = await prisma.assessment.create({
      data: {
        satgasId: data.satgasId,
        facilitatorId: data.facilitatorId,
        period: data.evalPeriod,
        finalScore: finalScore,
        goldStars: goldStarEarned,
        silverStars: silverStarEarned,
        notes: data.generalNotes || "",
        details: {
          create: data.aspectScores.map((item) => ({
            aspectId: item.aspectId,
            score: item.score,
            notes: item.notes || "",
          })),
        },
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

// Ambil Aspek Penilaian Aktif dari Database
export async function getActiveAspects() {
  try {
    const aspects = await prisma.aspect.findMany({
      orderBy: { order: "asc" },
    });
    return aspects;
  } catch (error) {
    // Fallback jika database belum diseed
    return [
      { id: "asp-1", name: "Kedisiplinan & Kehadiran", category: "A", weight: 20 },
      { id: "asp-2", name: "Kualitas Eksekusi Program", category: "B", weight: 25 },
      { id: "asp-3", name: "Kerjasama & Komunikasi Tim", category: "C", weight: 20 },
      { id: "asp-4", name: "Inisiatif & Problem Solving", category: "D", weight: 20 },
      { id: "asp-5", name: "Pelaporan & Administrasi", category: "E", weight: 15 },
    ];
  }
}