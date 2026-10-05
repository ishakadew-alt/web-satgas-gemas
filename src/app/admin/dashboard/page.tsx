"use client";

import { useState, useEffect } from "react";
import { getDashboardStats } from "@/app/actions/dashboard";
import { Star, FileEdit, Trophy, Award } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

export default function NarotamaDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const stats = await getDashboardStats();
        setData(stats);
      } catch (err) {
        console.error("Failed loading stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-emerald-400 text-sm font-mono">
        Memuat data dashboard Narotama...
      </div>
    );
  }

  return (
    <div className="bg-[#0b132b] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6">
      {/* Header Program */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-widest text-emerald-400 font-bold uppercase">
            Sistem Evaluasi Kinerja Satgas
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
            Program Narotama
          </h1>
          <p className="text-xs text-slate-400">Bakti Sosial Djarum Foundation</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/assessments"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-lg shadow-emerald-500/20"
          >
            <FileEdit size={16} /> Input Penilaian
          </Link>
          <Link
            href="/admin/assessments"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition"
          >
            <Trophy size={16} className="text-amber-400" /> Rekap & Leaderboard
          </Link>
        </div>
      </div>

      {/* 4 Cards Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c2541] p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Total Satgas Terdaftar</span>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-3xl font-extrabold text-white">{data?.totalSatgas || 0}</span>
            <span className="text-xs text-slate-500 font-mono">Personel</span>
          </div>
        </div>

        <div className="bg-[#1c2541] p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Evaluasi Bulan Ini</span>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-3xl font-extrabold text-emerald-400">{data?.evaluasiBulanIni || 0}</span>
            <span className="text-xs text-slate-500 font-mono">Sesi Selesai</span>
          </div>
        </div>

        <div className="bg-[#1c2541] p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Akumulasi Evaluasi</span>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-3xl font-extrabold text-white">{data?.totalAssessments || 0}</span>
            <span className="text-xs text-slate-500 font-mono">Total Form</span>
          </div>
        </div>

        <div className="bg-[#1c2541] p-5 rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#1c2541] to-amber-950/20 flex flex-col justify-between">
          <span className="text-[11px] text-amber-400 font-bold">Total Bintang Emas</span>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={28} />
              <span className="text-3xl font-extrabold text-white">{data?.totalGoldStars || 0}</span>
            </div>
            <span className="text-xs text-amber-500/80 font-mono">Poin Nasional</span>
          </div>
        </div>
      </div>

      {/* Grid Grafik Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Bintang Emas */}
        <div className="bg-[#1c2541] p-5 rounded-xl border border-slate-800/80">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📊 Perolehan Bintang Emas per Wilayah
            </h3>
            <p className="text-[11px] text-slate-400">
              Perbandingan perolehan Bintang Emas Satgas per Wilayah Kerja
            </p>
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.starPerRegionData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b132b", borderColor: "#334155" }}
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Bar dataKey="gold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart Tren Aktivitas */}
        <div className="bg-[#1c2541] p-5 rounded-xl border border-slate-800/80">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📈 Tren Aktivitas Evaluasi Penilaian
            </h3>
            <p className="text-[11px] text-slate-400">
              Jumlah form penilaian yang diselesaikan per bulan
            </p>
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyTrendData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b132b", borderColor: "#334155" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Menu Aksi Cepat & Top 3 Satgas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Pintas */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/assessments"
            className="bg-[#1c2541] p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition group block"
          >
            <div className="p-2.5 bg-slate-800/80 w-fit rounded-lg mb-3 text-slate-300 group-hover:text-emerald-400 transition">
              📄
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
              Form Penilaian Satgas
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Isi evaluasi kinerja mingguan/bulanan Satgas berdasarkan Kategori A - E.
            </p>
          </Link>

          <Link
            href="/admin/assessments"
            className="bg-[#1c2541] p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition group block"
          >
            <div className="p-2.5 bg-slate-800/80 w-fit rounded-lg mb-3 text-slate-300 group-hover:text-amber-400 transition">
              🏆
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition">
              Leaderboard & Rekapitulasi
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pantau ranking Satgas, akumulasi Bintang Emas, dan sisa Bintang Silver per Wilayah.
            </p>
          </Link>
        </div>

        {/* Top 3 Satgas Terbaik */}
        <div className="bg-[#1c2541] p-5 rounded-xl border border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              🏅 Top 3 Satgas Terbaik
            </h3>
            <Link href="/admin/users" className="text-[11px] text-emerald-400 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.topSatgasList?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada data Satgas</p>
            ) : (
              data?.topSatgasList?.map((satgas: any, index: number) => (
                <div
                  key={satgas.id}
                  className="bg-[#0b132b]/60 p-3 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        index === 0
                          ? "bg-amber-400 text-slate-950"
                          : index === 1
                          ? "bg-slate-300 text-slate-950"
                          : "bg-amber-700 text-white"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">{satgas.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {satgas.cluster?.name || "Tanpa Klaster"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-amber-400 font-bold flex items-center justify-end gap-1 text-[11px]">
                      <Star size={12} className="fill-amber-400" /> 0 Gold
                    </div>
                    <div className="text-[10px] text-slate-500">+0 Silver</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}