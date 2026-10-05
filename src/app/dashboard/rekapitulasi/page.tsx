"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LEVEL_BADGES: Record<string, { label: string; color: string }> = {
  WIJIL: { label: "Wijil", color: "bg-slate-800 text-slate-300 border-slate-700" },
  MADYA: { label: "Madya", color: "bg-blue-950 text-blue-400 border-blue-800/50" },
  NARAYA: { label: "Naraya", color: "bg-indigo-950 text-indigo-400 border-indigo-800/50" },
  SUWAWANA: { label: "Suwawana", color: "bg-purple-950 text-purple-400 border-purple-800/50" },
  JANA_UTAMA: { label: "Jana Utama", color: "bg-amber-950 text-amber-400 border-amber-800/50" },
};

export default function RekapitulasiPage() {
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedWilayah, setSelectedWilayah] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  useEffect(() => {
    fetchSummary();
  }, [selectedWilayah, selectedMonth, selectedYear]);

  const fetchSummary = () => {
    setLoading(true);
    let query = "?";
    if (selectedWilayah) query += `wilayah=${selectedWilayah}&`;
    if (selectedMonth) query += `periodMonth=${selectedMonth}&`;
    if (selectedYear) query += `periodYear=${selectedYear}&`;

    fetch(`/api/assessments/summary${query}`)
      .then((res) => res.json())
      .then((data) => setSummaryData(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🏆 Rekapitulasi & Leaderboard Satgas
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Ringkasan akumulasi Bintang Emas & Bintang Silver seluruh Satgas Program Narotama
            </p>
          </div>
          <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition">
            ← Kembali
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Filter Wilayah</label>
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Semua Wilayah</option>
              <option value="BARAT">Barat</option>
              <option value="TIMUR">Timur</option>
              <option value="CENTRAL">Central</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Bulan Evaluasi</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Semua Bulan (Kumulatif)</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Bulan Ke-{i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Tabel Rekapitulasi */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Daftar Peringkat Kinerja Satgas</h2>
            <span className="text-xs text-slate-400">{summaryData.length} Satgas Terdaftar</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Memuat data rekapitulasi...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1F2937]/60 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Nama Satgas</th>
                    <th className="py-3 px-4">NIP</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Cluster / Wilayah</th>
                    <th className="py-3 px-4 text-center">Total Silver</th>
                    <th className="py-3 px-4 text-center">Bintang Emas</th>
                    <th className="py-3 px-4 text-center">Jumlah Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {summaryData.map((satgas, idx) => {
                    const badge = LEVEL_BADGES[satgas.level] || LEVEL_BADGES.WIJIL;

                    return (
                      <tr key={satgas.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 font-bold text-slate-400">
                          {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : `#${idx + 1}`}
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">{satgas.name}</td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-400">{satgas.nip}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-300">
                          <div>{satgas.clusterName}</div>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">{satgas.wilayah}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-300">
                          ⚪ {satgas.totalSilver}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs px-3 py-1.5 rounded-lg font-bold inline-block">
                            ⭐ {satgas.totalGold} Gold <span className="text-[10px] text-amber-400/70">(+{satgas.sisaSilver} Silver)</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-slate-400">
                          {satgas.totalEvaluations} Kali
                        </td>
                      </tr>
                    );
                  })}
                  {summaryData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada data penilaian yang ditemukan untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}