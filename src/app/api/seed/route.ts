import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Kita buat password standarnya: admin123
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Buat akun Superadmin (jika belum ada)
    const superadmin = await prisma.user.upsert({
      where: { nip: "ADMIN001" },
      update: {},
      create: {
        nip: "ADMIN001",
        name: "Bapak Superadmin",
        password: hashedPassword,
        role: "SUPERADMIN",
        level: "JANA_UTAMA", // Tingkatan tertinggi
      },
    });

    return NextResponse.json({ 
      message: "Akun Superadmin berhasil dibuat! Silakan kembali ke halaman login.", 
      nip: superadmin.nip 
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 });
  }
}