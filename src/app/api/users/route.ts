import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nip, password, role } = body;

    // 1. Validasi jika NIP sudah pernah didaftarkan
    const existingUser = await prisma.user.findUnique({
      where: { nip },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "NIP tersebut sudah terdaftar di sistem!" },
        { status: 400 }
      );
    }

    // 2. Enkripsi password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        nip,
        password: hashedPassword,
        role,
        level: "WIJIL", // Sesuai aturan, semua user baru mulai dari Wijil
      },
    });

    return NextResponse.json(
      { message: "Pengguna berhasil ditambahkan!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}