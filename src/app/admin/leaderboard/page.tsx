"use client";

import { useState, useEffect } from "react";
import { getLeaderboardData } from "@/app/actions/leaderboard";
import { getExportData } from "@/app/actions/export";
import { Trophy, Star, Search, Building2, Award, Download } from "lucide-react";

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCluster, setFilterCluster] = useState("ALL");

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const res = await getLeaderboardData();
      setData(res);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const handleExportCSV = async () => {
    const exportRows = await getExportData();
    if (exportRows.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    const headers = [
      "No",
      "NIP",
      "Nama Satgas",
      "Level",
      "Klaster",
      "Total Evaluasi",
      "Rata-Rata Skor",
      "Bintang Emas",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [
        headers.join(";"),
        ...exportRows.map((r) =>
          [
            r.No,
            `"${r.NIP}"`,
            `"${r.Nama}"`,
            `"${r.Level}"`,
            `"${r.Klaster}"`,
            r.TotalEvaluasi,
            r.RataRataSkor,
            r.BintangEmas,
          ].join(";")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_Kinerja_Satgas_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clusters = Array.from(new Set(data.map((item) => item.cluster)));

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.toLowerCase().includes(search.toLowerCase());
    const matchCluster = filterCluster === "ALL" || item.cluster === filterCluster;
    return matchSearch && matchCluster;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Trophy size={16} /> Leaderboard & Rekapitulasi Nasional
          </div>
          <h1 className="text-2xl font-black mt-1">Peringkat Kinerja Satgas GEMAS</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Akumulasi performa, rata-rata skor evaluasi, dan perolehan Bintang Emas.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm border border-emerald-500 shrink-0"
        >
          <Download size={16} /> Unduh CSV / Excel
        </button>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        <select
          value={filterCluster}
          onChange={(e) => setFilterCluster(e.target.value)}
          className="p-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="ALL">Semua Klaster / Wilayah</option>
          {clusters.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4 w-16 text-center">Rank</th>
              <th className="p-4">Anggota Satgas</th>
              <th className="p-4">Level</th>
              <th className="p-4">Klaster</th>
              <th className="p-4 text-center">Evaluasi</th>
              <th className="p-4 text-center">Rata-Rata Skor</th>
              <th className="p-4 text-right">Bintang Emas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Memuat data leaderboard...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Data Satgas tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((satgas, index) => (
                <tr key={satgas.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-extrabold text-xs ${
                        index === 0
                          ? "bg-amber-400 text-slate-950 shadow-sm"
                          : index === 1
                          ? "bg-slate-300 text-slate-900"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{satgas.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">NIP: {satgas.nip}</div>
                  </td>
                  <td className="p-4">
                    {satgas.level ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Award size={11} /> {satgas.level.replace("_", " ")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1 font-medium">
                      <Building2 size={13} className="text-blue-500" />
                      {satgas.cluster}
                    </div>
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-700">
                    {satgas.totalEvaluasi} Kali
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold text-xs ${
                        satgas.rataRataScore >= 80
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : satgas.rataRataScore >= 60
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {satgas.rataRataScore}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {satgas.goldStars} Gold
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}