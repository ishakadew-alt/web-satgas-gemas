"use server";

import { prisma } from "@/lib/prisma";

export async function getSatgasMyProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cluster: true,
        satgasAssessments: {
          include: {
            facilitator: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return null;

    const totalEvaluasi = user.satgasAssessments.length;
    const totalSkor = user.satgasAssessments.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const rataRata = totalEvaluasi > 0 ? totalSkor / totalEvaluasi : 0;
    const goldStars = rataRata >= 85 ? Math.floor(rataRata / 10) - 7 : 0;

    return {
      ...user,
      totalEvaluasi,
      rataRataScore: Math.round(rataRata * 10) / 10,
      goldStars: goldStars > 0 ? goldStars : 0,
    };
  } catch (error) {
    console.error("Error getSatgasMyProfile:", error);
    return null;
  }
}