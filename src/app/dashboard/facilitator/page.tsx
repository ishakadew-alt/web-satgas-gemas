import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, FileCheck2, ClipboardList } from "lucide-react";

export default async function FacilitatorDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Fasilitator</h1>
        <p className="text-slate-500 mt-1">
          Selamat datang kembali, <span className="font-semibold text-slate-700">{session?.user?.name || "Fasilitator"}</span>.
        </p>
      </div>

      {/* Tiga Kartu Statistik Sederhana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Satgas Binaan</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Penilaian Selesai</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Evaluasi</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
          </div>
        </div>
      </div>

      {/* Papan Informasi */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Informasi Sistem</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Gunakan menu <strong>Penilaian Satgas</strong> di sidebar untuk memberikan evaluasi performa kepada anggota Satgas yang Anda fasilitasi secara mendetail. 
          Menu <strong>Rekapitulasi</strong> dapat digunakan untuk melihat ringkasan hasil penilaian yang telah Anda berikan sebelumnya.
        </p>
      </div>
    </div>
  );
}