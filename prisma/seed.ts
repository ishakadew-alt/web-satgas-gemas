import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses Seeding Database...");

  // 1. Hash Password Default ("password123")
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Clear Data Lama (Menghindari Foreign Key Constraint)
  await prisma.assessmentDetail.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.aspect.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.cluster.deleteMany({});

  console.log("🧹 Data lama berhasil dibersihkan.");

  // 3. Seed Master Cluster
  const clusterBarat1 = await prisma.cluster.create({
    data: { name: "Cluster Barat 1", wilayah: "BARAT" as any },
  });
  const clusterTimur1 = await prisma.cluster.create({
    data: { name: "Cluster Timur 1", wilayah: "TIMUR" as any },
  });
  const clusterCentral1 = await prisma.cluster.create({
    data: { name: "Cluster Central 1", wilayah: "CENTRAL" as any },
  });

  console.log("📍 Master Cluster dibuat.");

  // 4. Seed User Superadmin
  await prisma.user.create({
    data: {
      name: "Superadmin Narotama",
      nip: "SA-001",
      password: hashedPassword,
      role: "SUPERADMIN" as any,
    },
  });

  // 5. Seed User Facilitator (Per Wilayah)
  await prisma.user.create({
    data: {
      name: "Fasilitator Barat (Budi)",
      nip: "FAC-BARAT-01",
      password: hashedPassword,
      role: "FACILITATOR" as any,
      clusterId: clusterBarat1.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Fasilitator Timur (Siti)",
      nip: "FAC-TIMUR-01",
      password: hashedPassword,
      role: "FACILITATOR" as any,
      clusterId: clusterTimur1.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Fasilitator Central (Agus)",
      nip: "FAC-CENTRAL-01",
      password: hashedPassword,
      role: "FACILITATOR" as any,
      clusterId: clusterCentral1.id,
    },
  });

  console.log("👑 Superadmin & Fasilitator dibuat.");

  // 6. Seed User Satgas
  const satgasData = [
    { name: "Ahmad Satgas", nip: "STG-B01", level: "WIJIL", clusterId: clusterBarat1.id },
    { name: "Dian Satgas", nip: "STG-B02", level: "WIJIL", clusterId: clusterBarat1.id },
    { name: "Eko Satgas", nip: "STG-T01", level: "WIJIL", clusterId: clusterTimur1.id },
    { name: "Fani Satgas", nip: "STG-T02", level: "WIJIL", clusterId: clusterTimur1.id },
    { name: "Gita Satgas", nip: "STG-C01", level: "WIJIL", clusterId: clusterCentral1.id },
  ];

  for (const item of satgasData) {
    await prisma.user.create({
      data: {
        name: item.name,
        nip: item.nip,
        password: hashedPassword,
        role: "SATGAS" as any,
        level: item.level as any,
        clusterId: item.clusterId,
      },
    });
  }

  // 7. Seed Master Kategori & Aspek Evaluasi (Kategori A - E)
  await prisma.category.create({
    data: {
      code: "A",
      name: "Pemeriksaan Kehamilan",
      aspects: {
        create: [
          { name: "Sikap & Keramahan Menyapa Pasien", type: "RATING" as any },
          { name: "Ketelitian Pengisian Buku KIA", type: "RATING" as any },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      code: "B",
      name: "Kelancaran Pelaksanaan Pemeriksaan Kehamilan",
      aspects: {
        create: [
          { name: "Pendaftaran", type: "RATING" as any },
          { name: "Cek Gula Darah", type: "RATING" as any },
          { name: "Penyerahan Intervensi", type: "RATING" as any },
          { name: "Penyiapan Perlengkapan", type: "RATING" as any },
          { name: "Perform Narasumber Laktasi", type: "RATING" as any },
          { name: "Cek Tensi", type: "RATING" as any },
          { name: "Monitoring", type: "RATING" as any },
          { name: "Pengukuran Lila, TB, BB", type: "RATING" as any },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      code: "C",
      name: "Kedisiplinan & Sikap Kerja",
      aspects: {
        create: [
          { name: "Kehadiran Tepat Waktu (Briefing & Operational)", type: "RATING" as any },
          { name: "Penggunaan Seragam & Atribut Lengkap", type: "RATING" as any },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      code: "D",
      name: "Kerjasama Tim & Inisiatif",
      aspects: {
        create: [
          { name: "Proaktif Membantu Rekan Tim", type: "RATING" as any },
          { name: "Tanggap Dalam Penanganan Kendala Lapangan", type: "RATING" as any },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      code: "E",
      name: "Pelanggaran Aturan & Kedisiplinan (Penalty)",
      aspects: {
        create: [
          { name: "Terlambat > 15 Menit Tanpa Keterangan", type: "PENALTY" as any, deduction: 2 },
          { name: "Atribut/Seragam Tidak Lengkap", type: "PENALTY" as any, deduction: 1 },
          { name: "Meninggalkan Pos Tanpa Izin", type: "PENALTY" as any, deduction: 3 },
        ],
      },
    },
  });

  console.log("📚 Master Kategori & Aspek Evaluasi dibuat.");
  console.log("✅ Seeding selesai secara keseluruhan!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });