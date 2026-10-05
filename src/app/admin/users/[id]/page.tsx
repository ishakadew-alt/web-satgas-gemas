"use client";

import { useState, useEffect, use } from "react";
import { getUserDetail } from "@/app/actions/user";
import { 
  ArrowLeft, Star, Calendar, ShieldCheck, TrendingUp 
} from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const data = await getUserDetail(id);
      setUserData(data);
      setLoading(false);
    }
    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        Memuat detail laporan Satgas...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 text-center text-xs text-red-500">
        Data anggota Satgas tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Navigasi */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Laporan Detail Kinerja Satgas</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Rekam jejak evaluasi dan perkembangan performa individu
            </p>
          </div>
        </div>
      </div>

      {/* Profil Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xl flex items-center justify-center shrink-0">
            {userData.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">{userData.name}</h2>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                {userData.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
              <span>NIP: <strong className="text-gray-700">{userData.nip}</strong></span>
              <span>Klaster: <strong className="text-gray-700">{userData.cluster?.name || "-"}</strong></span>
              {userData.level && (
                <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                  {userData.level.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bintang Emas & Rata-rata */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 w-full md:w-auto justify-around">
          <div className="text-center px-3">
            <div className="text-[10px] text-gray-400 font-medium">Bintang Emas</div>
            <div className="flex items-center justify-center gap-1 font-bold text-amber-600 text-sm mt-0.5">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {userData.goldStars} Gold
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="text-center px-3">
            <div className="text-[10px] text-gray-400 font-medium">Rata-Rata Nilai</div>
            <div className="font-extrabold text-emerald-600 text-sm mt-0.5 font-mono">
              {userData.rataRataScore} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Perkembangan Skor */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            Grafik Perkembangan Evaluasi Kinerja
          </h3>
          <p className="text-[11px] text-gray-400">
            Tren perubahan skor penilaian dari waktu ke waktu
          </p>
        </div>

        {userData.scoreTrend?.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Belum ada riwayat penilaian untuk ditampilkan pada grafik.
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userData.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#cbd5e1" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Skor"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Riwayat Evaluasi Lengkap */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600" />
          Riwayat & Catatan Evaluasi Fasilitator
        </h3>

        {!userData.assessmentsRecentFirst || userData.assessmentsRecentFirst.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Belum ada catatan evaluasi.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {userData.assessmentsRecentFirst.map((item: any) => (
              <div key={item.id} className="py-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-800">
                    Penguji: {item.facilitator?.name} ({item.facilitator?.role})
                  </span>
                  <span className="px-2.5 py-1 rounded-md font-bold bg-green-50 text-green-700 border border-green-200">
                    Skor: {item.score}
                  </span>
                </div>

                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {item.notes || "Tidak ada catatan tambahan."}
                </p>

                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}