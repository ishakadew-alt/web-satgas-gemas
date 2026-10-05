"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State Tambah Aspek
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [aspectName, setAspectName] = useState("");
  const [aspectType, setAspectType] = useState<"RATING" | "PENALTY">("RATING");
  const [deduction, setDeduction] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch("/api/settings/aspects")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleAddAspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aspectName || !selectedCategory) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/aspects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name: aspectName,
          type: aspectType,
          deduction: aspectType === "PENALTY" ? deduction : 0,
        }),
      });

      if (res.ok) {
        setAspectName("");
        setDeduction(0);
        fetchCategories();
      } else {
        alert("Gagal menambahkan aspek.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAspect = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aspek penilaian ini?")) return;

    try {
      const res = await fetch(`/api/settings/aspects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0F172A] text-slate-400 flex items-center justify-center">Memuat Pengaturan...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              ⚙️ Pengaturan Kategori & Aspek Penilaian
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Kelola kategori A-E, kriteria aspek, dan bobot pengurangan bintang pelanggaran.
            </p>
          </div>
          <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition">
            ← Kembali
          </Link>
        </div>

        {/* Info Aturan Konversi Bintang */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Aturan Sistem Bintang</span>
            <p className="text-sm text-slate-300">
              Setiap <b className="text-amber-400">5 Bintang Silver</b> otomatis dikonversi menjadi <b className="text-amber-300">1 Bintang Emas</b>.
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            Rating: <span className="text-slate-200 font-mono">No Opinion (0) s.d Excellent (4)</span>
          </div>
        </div>

        {/* Form Tambah Aspek Baru */}
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">➕ Tambah Aspek Penilaian / Pelanggaran</h2>
          <form onSubmit={handleAddAspect} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Pilih Kategori */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  const cat = categories.find((c) => c.id === e.target.value);
                  if (cat?.code === "E") {
                    setAspectType("PENALTY");
                  } else {
                    setAspectType("RATING");
                  }
                }}
                className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code}. {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Aspek */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Nama Aspek / Indikator</label>
              <input
                type="text"
                placeholder="Contoh: Supervisi Laporan Pumping"
                value={aspectName}
                onChange={(e) => setAspectName(e.target.value)}
                required
                className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tipe & Pengurangan */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {aspectType === "PENALTY" ? "Pengurangan (Silver Stars)" : "Tipe Kriteria"}
              </label>
              {aspectType === "PENALTY" ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={deduction}
                  onChange={(e) => setDeduction(Number(e.target.value))}
                  required
                  className="w-full bg-[#1F2937] border border-red-500/50 rounded-lg p-2.5 text-sm text-red-400 focus:outline-none"
                  placeholder="Misal: 2"
                />
              ) : (
                <input
                  type="text"
                  disabled
                  value="Rating (0 - 4 Stars)"
                  className="w-full bg-[#1F2937]/50 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              )}
            </div>

            <div className="md:col-span-4 flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition"
              >
                {submitting ? "Menyimpan..." : "Simpan Aspek"}
              </button>
            </div>
          </form>
        </div>

        {/* Daftar Kategori & Aspek */}
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="bg-slate-800 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-mono">
                      Kategori {cat.code}
                    </span>
                    {cat.name}
                  </h3>
                  {cat.isSelectable && (
                    <p className="text-xs text-amber-400/80 mt-1">
                      📌 Kategori ini bersifat opsional berdasarkan lokasi/penempatan Satgas.
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500">{cat.aspects.length} Aspek Terdaftar</span>
              </div>

              {/* Tabel Aspek dalam Kategori */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#1F2937]/50 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-lg">No</th>
                      <th className="py-2.5 px-4">Nama Aspek / Kriteria</th>
                      <th className="py-2.5 px-4">Tipe Penilaian</th>
                      <th className="py-2.5 px-4 text-center">Bobot / Dampak</th>
                      <th className="py-2.5 px-4 text-right rounded-r-lg">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cat.aspects.map((asp: any, idx: number) => (
                      <tr key={asp.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">{asp.name}</td>
                        <td className="py-3 px-4">
                          {asp.type === "PENALTY" ? (
                            <span className="bg-red-950 text-red-400 text-xs px-2.5 py-1 rounded-full border border-red-800/40 font-semibold">
                              Pelanggaran
                            </span>
                          ) : (
                            <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-800/40 font-semibold">
                              Rating Work Performance
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {asp.type === "PENALTY" ? (
                            <span className="text-red-400">-{asp.deduction} Silver</span>
                          ) : (
                            <span className="text-amber-400">0 - 4 Silver Stars</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAspect(asp.id)}
                            className="text-xs text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/60 border border-red-800/30 px-3 py-1.5 rounded-lg transition"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cat.aspects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500 text-xs">
                          Belum ada aspek untuk kategori ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}