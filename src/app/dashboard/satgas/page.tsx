"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SatgasPanel() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/satgas")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        // Cari data milik Satgas yang sedang login
        if (session?.user?.id) {
          const currentSatgas = data.find((item: any) => item.id === session.user.id);
          setMyStats(currentSatgas);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Papan Peringkat & Evaluasi</h1>
            <p className="text-gray-500 mt-1">Program Narotama - Satgas GEMAS</p>
          </div>
          <Link href="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition">
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Ringkasan Nilai Pribadi Satgas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Tingkatan Anda</p>
            <p className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              🌱 {myStats?.level || session?.user?.level || "WIJIL"}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Rata-Rata Nilai</p>
            <p className="text-3xl font-extrabold text-green-900">
              {myStats?.avgScore ?? 0} <span className="text-sm font-normal text-gray-500">/ 100</span>
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Total Evaluasi</p>
            <p className="text-3xl font-extrabold text-purple-900">
              {myStats?.totalAssessments ?? 0} <span className="text-sm font-normal text-gray-500">kali</span>
            </p>
          </div>
        </div>

        {/* Tabel Leaderboard */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">🏆 Leaderboard Satgas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-semibold text-gray-500">
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Nama Satgas</th>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4 text-center">Rata-Rata Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {leaderboard.map((satgas, index) => {
                  const isMe = satgas.id === session?.user?.id;
                  return (
                    <tr key={satgas.id} className={isMe ? "bg-blue-50 font-semibold" : "hover:bg-slate-50"}>
                      <td className="py-4 px-4 font-bold text-gray-700">
                        {index === 0 ? "🥇 #1" : index === 1 ? "🥈 #2" : index === 2 ? "🥉 #3" : `#${index + 1}`}
                      </td>
                      <td className="py-4 px-4 text-gray-800">
                        {satgas.name} {isMe && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">Saya</span>}
                      </td>
                      <td className="py-4 px-4 text-gray-500">{satgas.nip}</td>
                      <td className="py-4 px-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{satgas.level}</span></td>
                      <td className="py-4 px-4 text-center font-bold text-blue-700 text-base">{satgas.avgScore}</td>
                    </tr>
                  );
                })}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">Belum ada data Satgas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Riwayat Penilaian Pribadi */}
        {myStats?.history?.length > 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">📝 Catatan Evaluasi Saya</h2>
            <div className="space-y-4">
              {myStats.history.map((evaluasi: any) => (
                <div key={evaluasi.id} className="p-4 rounded-xl border border-gray-100 bg-slate-50 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">Penilai: {evaluasi.facilitator?.name || "Fasilitator"}</p>
                    <p className="text-sm text-gray-600 mt-1">{evaluasi.notes || "Tidak ada catatan khusus."}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(evaluasi.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600 bg-white px-3 py-1 rounded-lg border shadow-sm">
                    {evaluasi.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}