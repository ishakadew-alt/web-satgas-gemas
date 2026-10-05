"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const RATING_OPTIONS = [
  { value: "NO_OPINION", label: "No Opinion", silver: 0 },
  { value: "POOR", label: "Poor", silver: 1 },
  { value: "FAIR", label: "Fair", silver: 2 },
  { value: "GOOD", label: "Good", silver: 3 },
  { value: "EXCELLENT", label: "Excellent", silver: 4 },
];

export default function PenilaianPage() {
  const { data: session } = useSession();
  const [satgasList, setSatgasList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter Utama & Periode
  const [selectedWilayah, setSelectedWilayah] = useState<string>("");
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL | NOT_ASSESSED | DRAFT | SUBMITTED
  const [selectedSatgasId, setSelectedSatgasId] = useState<string>("");
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [periodYear, setPeriodYear] = useState<number>(2026);

  // Peran Khusus Kategori B
  const [selectedCatBRole, setSelectedCatBRole] = useState<string>("");

  // Form State
  const [evalForm, setEvalForm] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchFormData();
  }, [selectedWilayah, selectedCluster, periodMonth, periodYear]);

  const fetchFormData = () => {
    let query = `?periodMonth=${periodMonth}&periodYear=${periodYear}&`;
    if (selectedCluster) query += `clusterId=${selectedCluster}&`;
    if (selectedWilayah) query += `wilayah=${selectedWilayah}`;

    fetch(`/api/assessments${query}`)
      .then((res) => res.json())
      .then((data) => {
        setSatgasList(data.satgasList || []);
        setCategories(data.categories || []);
        setClusters(data.clusters || []);
        
        // Reset form jika categories ada
        if (data.categories) {
          initCleanForm(data.categories);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Inisialisasi Form Kosong/Bersih
  const initCleanForm = (cats: any[]) => {
    const initialForm: Record<string, any> = {};
    cats.forEach((cat: any) => {
      cat.aspects.forEach((asp: any) => {
        initialForm[asp.id] = {
          aspectId: asp.id,
          catCode: cat.code,
          type: asp.type,
          deduction: asp.deduction,
          rating: asp.type === "RATING" ? "NO_OPINION" : null,
          selected: false,
        };
      });
    });
    setEvalForm(initialForm);
  };

  // Fungsi Reset Total Form
  const handleResetForm = () => {
    setSelectedSatgasId("");
    setSelectedCatBRole("");
    initCleanForm(categories);
  };

  // Ketika Pilihan Satgas Berubah -> Load Data Eksisting (jika ada Draft/Sudah Dinilai)
  const handleSelectSatgas = (satgasId: string) => {
    setSelectedSatgasId(satgasId);
    setSelectedCatBRole("");

    if (!satgasId) {
      initCleanForm(categories);
      return;
    }

    const satgas = satgasList.find((s) => s.id === satgasId);
    if (satgas && satgas.existingAssessment) {
      const existingDetails = satgas.existingAssessment.details || [];
      const updatedForm = { ...evalForm };

      // Re-populate data rating
      categories.forEach((cat) => {
        cat.aspects.forEach((asp: any) => {
          const detail = existingDetails.find((d: any) => d.aspectId === asp.id);
          if (detail) {
            if (cat.code === "B") {
              setSelectedCatBRole(asp.id); // Auto set peran Kategori B yang tersimpan
            }

            if (asp.type === "PENALTY") {
              updatedForm[asp.id] = {
                ...updatedForm[asp.id],
                selected: detail.silverEarned < 0,
              };
            } else {
              updatedForm[asp.id] = {
                ...updatedForm[asp.id],
                rating: detail.rating || "NO_OPINION",
                selected: true,
              };
            }
          }
        });
      });

      setEvalForm(updatedForm);
    } else {
      initCleanForm(categories);
    }
  };

  // Kalkulasi Poin Real-time
  const calculateStars = () => {
    let totalSilver = 0;

    Object.values(evalForm).forEach((item: any) => {
      if (item.catCode === "B" && item.aspectId !== selectedCatBRole) {
        return;
      }

      if (item.type === "PENALTY") {
        if (item.selected) totalSilver -= Math.abs(item.deduction);
      } else {
        if (item.rating === "EXCELLENT") totalSilver += 4;
        else if (item.rating === "GOOD") totalSilver += 3;
        else if (item.rating === "FAIR") totalSilver += 2;
        else if (item.rating === "POOR") totalSilver += 1;
      }
    });

    const netSilver = Math.max(0, totalSilver);
    const totalGold = Math.floor(netSilver / 5);
    const sisaSilver = netSilver % 5;

    return { totalSilver, netSilver, totalGold, sisaSilver };
  };

  const { netSilver, totalGold, sisaSilver } = calculateStars();

  // Submit Handler (Bisa Draft atau Final)
  const handleSubmit = async (isDraftMode: boolean) => {
    if (!selectedSatgasId) {
      alert("Silakan pilih Satgas terlebih dahulu.");
      return;
    }

    setSubmitting(true);

    const details = Object.values(evalForm).filter((item: any) => {
      if (item.catCode === "B") {
        return item.aspectId === selectedCatBRole && item.rating !== "NO_OPINION";
      }
      return true;
    });

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          satgasId: selectedSatgasId,
          facilitatorId: (session?.user as any)?.id || null,
          periodMonth,
          periodYear,
          details,
          isDraft: isDraftMode,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        alert(
          isDraftMode
            ? "📝 Penilaian berhasil disimpan sebagai DRAFT!"
            : "✅ Penilaian Satgas berhasil DISIMPAN & DISELESAIKAN!"
        );
        // Reset Form & Reload Data Satgas
        handleResetForm();
        fetchFormData();
      } else {
        alert(`Gagal menyimpan: ${responseData.error || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan/server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter List Satgas Berdasarkan Status (All, Belum, Draft, Sudah)
  const filteredSatgasList = satgasList.filter((satgas) => {
    if (statusFilter === "ALL") return true;
    return satgas.assessmentStatus === statusFilter;
  });

  // Hitung jumlah Satgas per status
  const countNotAssessed = satgasList.filter((s) => s.assessmentStatus === "NOT_ASSESSED").length;
  const countDraft = satgasList.filter((s) => s.assessmentStatus === "DRAFT").length;
  const countSubmitted = satgasList.filter((s) => s.assessmentStatus === "SUBMITTED").length;

  if (loading) {
    return <div className="min-h-screen bg-[#0B0F17] text-slate-400 flex items-center justify-center">Memuat Form Penilaian...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              📝 Form Evaluasi & Penilaian Satgas
            </h1>
            <p className="text-slate-400 text-sm mt-1">Program Narotama — Bakti Sosial Djarum Foundation</p>
          </div>
          <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition">
            ← Kembali
          </Link>
        </div>

        {/* Tab Status Penilaian Satgas */}
        <div className="flex flex-wrap items-center gap-3 bg-[#111827] border border-slate-800 p-3 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 ml-2">Status Penilaian:</span>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === "ALL" ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            Semua ({satgasList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("NOT_ASSESSED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === "NOT_ASSESSED" ? "bg-rose-900/60 text-rose-300 border border-rose-700" : "text-rose-400 hover:bg-slate-800"
            }`}
          >
            🔴 Belum Dinilai ({countNotAssessed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === "DRAFT" ? "bg-amber-900/60 text-amber-300 border border-amber-700" : "text-amber-400 hover:bg-slate-800"
            }`}
          >
            🟡 Draft ({countDraft})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("SUBMITTED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === "SUBMITTED" ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700" : "text-emerald-400 hover:bg-slate-800"
            }`}
          >
            🟢 Sudah Dinilai ({countSubmitted})
          </button>
        </div>

        {/* Filter Penempatan Satgas & Periode */}
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Wilayah</label>
            <select
              value={selectedWilayah}
              onChange={(e) => {
                setSelectedWilayah(e.target.value);
                setSelectedCluster("");
              }}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Semua Wilayah</option>
              <option value="BARAT">Barat</option>
              <option value="TIMUR">Timur</option>
              <option value="CENTRAL">Central</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Cluster</label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Semua Cluster</option>
              {clusters.map((cl) => (
                <option key={cl.id} value={cl.id}>{cl.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Pilih Satgas yang Dinilai</label>
            <select
              value={selectedSatgasId}
              onChange={(e) => handleSelectSatgas(e.target.value)}
              required
              className="w-full bg-[#1F2937] border border-emerald-500/60 text-emerald-300 font-semibold rounded-lg p-2.5 text-sm focus:outline-none"
            >
              <option value="">-- Pilih Nama Satgas --</option>
              {filteredSatgasList.map((satgas) => {
                const badge =
                  satgas.assessmentStatus === "SUBMITTED"
                    ? "🟢 [Sudah Dinilai]"
                    : satgas.assessmentStatus === "DRAFT"
                    ? "🟡 [Draft]"
                    : "🔴 [Belum Dinilai]";

                return (
                  <option key={satgas.id} value={satgas.id}>
                    {badge} {satgas.name} ({satgas.nip}) — Cluster: {satgas.cluster?.name || "Unassigned"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Ringkasan Kalkulasi Bintang Real-time */}
        <div className="bg-[#111827] border border-emerald-500/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Kalkulasi Hasil Penilaian</span>
            <h3 className="text-xl font-bold text-white mt-1">
              Akumulasi Bintang Performa
            </h3>
          </div>

          <div className="flex gap-6 items-center">
            <div className="bg-[#1F2937] px-5 py-3 rounded-xl border border-slate-700 text-center">
              <span className="block text-xs text-slate-400 uppercase">Total Silver</span>
              <span className="text-2xl font-black text-slate-200">⚪ {netSilver}</span>
            </div>

            <div className="text-xl font-bold text-slate-500">=</div>

            <div className="bg-amber-950/40 px-6 py-3 rounded-xl border border-amber-500/40 text-center">
              <span className="block text-xs text-amber-400 uppercase font-bold">Bintang Emas</span>
              <span className="text-2xl font-black text-amber-300">⭐ {totalGold} Gold</span>
              <span className="block text-xs text-amber-400/80 mt-0.5">+ {sisaSilver} sisa silver</span>
            </div>
          </div>
        </div>

        {/* Form Input Aspek Penilaian */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {categories.map((cat) => {
            const isCategoryB = cat.code === "B";

            return (
              <div key={cat.id} className="bg-[#111827] border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="bg-emerald-950 text-emerald-400 text-xs px-3 py-1 rounded-md font-mono border border-emerald-800/40">
                        Kategori {cat.code}
                      </span>
                      {cat.name}
                    </h2>
                    {isCategoryB && (
                      <p className="text-xs text-amber-400 mt-1">
                        📌 Pilih 1 peran tugas yang dijalankan Satgas pada pemeriksaan kehamilan ini.
                      </p>
                    )}
                  </div>

                  {/* Dropdown Filter Peran khusus Kategori B */}
                  {isCategoryB && (
                    <div className="w-full md:w-72">
                      <select
                        value={selectedCatBRole}
                        onChange={(e) => setSelectedCatBRole(e.target.value)}
                        className="w-full bg-[#1F2937] border border-amber-500/60 text-amber-300 font-semibold rounded-lg p-2.5 text-xs focus:outline-none"
                      >
                        <option value="">-- Pilih Peran Satgas --</option>
                        {cat.aspects.map((asp: any) => (
                          <option key={asp.id} value={asp.id}>
                            {asp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Tampilan Aspek Kategori B jika belum memilih peran */}
                {isCategoryB && !selectedCatBRole && (
                  <div className="p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    Silakan pilih peran tugas Satgas terlebih dahulu pada dropdown di kanan atas Kategori B.
                  </div>
                )}

                {/* Daftar Aspek */}
                <div className="space-y-4">
                  {cat.aspects
                    .filter((asp: any) => {
                      if (isCategoryB) {
                        return asp.id === selectedCatBRole;
                      }
                      return true;
                    })
                    .map((asp: any) => {
                      const currentFormState = evalForm[asp.id] || {};

                      return (
                        <div key={asp.id} className="p-4 bg-[#1F2937]/40 rounded-xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="max-w-md">
                            <p className="font-semibold text-slate-200 text-sm">{asp.name}</p>
                            {asp.type === "PENALTY" && (
                              <span className="text-xs text-red-400 font-medium">
                                Pengurangan: -{asp.deduction} Bintang Silver jika terjadi pelanggaran
                              </span>
                            )}
                          </div>

                          {asp.type === "PENALTY" ? (
                            <label className="flex items-center gap-2 cursor-pointer bg-red-950/30 border border-red-800/40 px-4 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-900/40 transition">
                              <input
                                type="checkbox"
                                checked={currentFormState.selected || false}
                                onChange={(e) => {
                                  setEvalForm({
                                    ...evalForm,
                                    [asp.id]: { ...currentFormState, selected: e.target.checked },
                                  });
                                }}
                                className="rounded text-red-600 focus:ring-0"
                              />
                              Terjadi Pelanggaran (-{asp.deduction} Silver)
                            </label>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {RATING_OPTIONS.map((opt) => {
                                const isSelected = currentFormState.rating === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setEvalForm({
                                        ...evalForm,
                                        [asp.id]: { ...currentFormState, rating: opt.value, selected: true },
                                      });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                      isSelected
                                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                                        : "bg-[#111827] text-slate-400 border-slate-700 hover:bg-slate-800"
                                    }`}
                                  >
                                    {opt.label} <span className="opacity-60 text-[10px]">({opt.silver}★)</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* Action Submit Buttons */}
          <div className="flex flex-wrap justify-between items-center gap-4 pb-12">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-3 rounded-xl transition text-xs border border-slate-700"
            >
              🔄 Reset / Clean Form
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3.5 rounded-xl transition text-xs shadow-lg shadow-amber-900/30"
              >
                {submitting ? "Proses..." : "📝 Simpan sebagai Draft"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl transition text-xs shadow-lg shadow-emerald-900/40"
              >
                {submitting ? "Memproses..." : "💾 Simpan & Selesaikan Evaluasi"}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}