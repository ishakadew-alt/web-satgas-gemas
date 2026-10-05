import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil seluruh kategori beserta aspek-aspeknya
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        aspects: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { code: "asc" }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data aspek" }, { status: 500 });
  }
}

// POST: Tambah Aspek Penilaian / Pelanggaran Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, name, type, deduction } = body;

    if (!categoryId || !name) {
      return NextResponse.json({ error: "Kategori dan nama aspek wajib diisi" }, { status: 400 });
    }

    const newAspect = await prisma.aspect.create({
      data: {
        categoryId,
        name,
        type: type || "RATING",
        deduction: Number(deduction) || 0
      }
    });

    return NextResponse.json(newAspect);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambahkan aspek baru" }, { status: 500 });
  }
}

// DELETE: Hapus Aspek Penilaian
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID aspek dibutuhkan" }, { status: 400 });
    }

    await prisma.aspect.delete({ where: { id } });
    return NextResponse.json({ message: "Aspek berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus aspek" }, { status: 500 });
  }
}