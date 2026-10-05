import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Trophy, Star, Award, Calendar, CheckCircle2 } from "lucide-react";

export default async function SatgasDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Ambil histori penilaian personel Satgas ini
  const assessments = userId
    ? await prisma.assessment.findMany({
        where: { satgasId: userId },
        include: { facilitator: true, details: { include: { aspect: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const totalEvaluations = assessments.length;
  const totalGold = assessments.reduce((acc, cur) => acc + (cur.goldStars || 0), 0);
  const totalSilver = assessments.reduce((acc, cur) => acc + (cur.silverStars || 0), 0);
  const avgScore =
    totalEvaluations > 0
      ? Math.round(assessments.reduce((acc, cur) => acc + cur.finalScore, 0) / totalEvaluations)
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Trophy size={16} /> Portal Anggota Satgas
        </div>
        <h1 className="text-2xl font-black mt-1">
          Selamat Datang, {session?.user?.name || "Satgas GEMAS"}
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Pantau raihan Bintang Emas, performa evaluasi berkala, dan catatan perkembangan kinerja Anda.
        </p>
      </div>

      {/* Ringkasan Statistik Performa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Rata-Rata Skor</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{avgScore} / 100</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Award size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Bintang Emas</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{totalGold} Gold</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Star size={24} className="fill-amber-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Bintang Silver</p>
            <p className="text-2xl font-black text-slate-600 mt-1">{totalSilver} Silver</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
            <Star size={24} className="fill-slate-300" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Evaluasi</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalEvaluations} Kali</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Histori Evaluasi Penilaian */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" /> Riwayat Evaluasi Performa
          </h2>
        </div>

        {assessments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada catatan evaluasi dari Fasilitator.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {assessments.map((item) => (
              <div className="p-5 space-y-3 hover:bg-slate-50/50 transition" key={item.id}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {item.period}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Evaluator: <span className="font-semibold text-slate-700">{item.facilitator.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-800">{item.finalScore} Poin</span>
                    {item.goldStars > 0 && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <Star size={12} className="fill-amber-400" /> +1 Gold
                      </span>
                    )}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}