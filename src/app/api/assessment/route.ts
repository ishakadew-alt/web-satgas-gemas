import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi GET: Mengambil daftar semua anggota Satgas
export async function GET() {
  try {
    const satgasList = await prisma.user.findMany({
      where: { role: "SATGAS" },
      select: { id: true, name: true, nip: true, level: true },
    });
    return NextResponse.json(satgasList);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data Satgas" }, { status: 500 });
  }
}

// Fungsi POST: Menyimpan nilai dari Fasilitator ke database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { satgasId, facilitatorId, score, notes } = body;

    const newAssessment = await prisma.assessment.create({
      data: {
        score: parseFloat(score),
        notes,
        satgasId,
        facilitatorId,
      },
    });

    return NextResponse.json({ message: "Penilaian berhasil disimpan!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan penilaian" }, { status: 500 });
  }
}