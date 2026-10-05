"use client";

import { useState, useEffect } from "react";
import { getAssessmentsData, deleteAssessment } from "@/app/actions/assessment";
import { ClipboardCheck, Search, Trash2, User, Calendar, Award } from "lucide-react";
import Link from "next/link";
import { Plus } from "lucide-react";

// Di dalam return (bagian Header):
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-xl font-bold text-gray-800">Data Evaluasi</h1>
    <p className="text-xs text-gray-500 mt-1">Rekap hasil penilaian dan evaluasi kinerja anggota Satgas</p>
  </div>
  <Link
    href="/admin/assessments/new"
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-medium transition shadow-sm"
  >
    <Plus size={16} /> Tambah Evaluasi Baru
  </Link>
</div>

export default function AssessmentListPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAssessments = async () => {
    setLoading(true);
    const data = await getAssessmentsData();
    setAssessments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data evaluasi ini?")) {
      await deleteAssessment(id);
      fetchAssessments();
    }
  };

  const filteredAssessments = assessments.filter(
    (a) =>
      a.targetUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.evaluator?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Data Evaluasi</h1>
          <p className="text-xs text-gray-500 mt-1">Rekap hasil penilaian dan evaluasi kinerja anggota Satgas</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama Satgas atau Penguji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        />
      </div>

      {/* Tabel Evaluasi */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Satgas (Dinilai)</th>
              <th className="p-4">Level</th>
              <th className="p-4">Penguji / Fasilitator</th>
              <th className="p-4">Nilai</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Memuat data evaluasi...</td>
              </tr>
            ) : filteredAssessments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Belum ada data evaluasi.</td>
              </tr>
            ) : (
              filteredAssessments.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-semibold text-gray-800">
                    {item.targetUser?.name}
                    <div className="text-[10px] text-gray-400 font-normal">NIP: {item.targetUser?.nip}</div>
                  </td>
                  <td className="p-4">
                    {item.targetUser?.level ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        <Award size={12} /> {item.targetUser.level.replace("_", " ")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-blue-500" />
                      {item.evaluator?.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg font-bold bg-green-50 text-green-700 border border-green-200">
                      {item.score || 0}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Data"
                    >
                      <Trash2 size={15} />
                    </button>
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