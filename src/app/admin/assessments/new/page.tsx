"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsersData } from "@/app/actions/user";
import { createAssessment } from "@/app/actions/assessment";
import { ArrowLeft, Save, ClipboardCheck, UserCheck, ShieldAlert, Award } from "lucide-react";
import Link from "next/link";

export default function NewAssessmentPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [score, setScore] = useState(80);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const data = await getUsersData();
      setUsers(data.users || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const satgasList = users.filter((u) => u.role === "SATGAS");
  const evaluatorList = users.filter((u) => u.role === "SUPERADMIN" || u.role === "FACILITATOR");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    formData.set("score", score.toString());

    const result = await createAssessment(formData);

    if (result.success) {
      router.push("/admin/assessments");
    } else {
      setErrorMessage(result.error || "Terjadi kesalahan saat menyimpan.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        Memuat data form penilaian...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/assessments"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Form Input Penilaian Satgas</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Masukkan hasil evaluasi kinerja bulanan/mingguan Satgas
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          {errorMessage}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pilih Satgas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
              Anggota Satgas (Yang Dinilai) *
            </label>
            <select
              name="satgasId"
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Pilih Satgas --</option>
              {satgasList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nip}) - {s.level ? s.level.replace("_", " ") : "Tanpa Level"}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Penguji */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
              Penguji / Fasilitator *
            </label>
            <select
              name="facilitatorId"
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Pilih Penguji --</option>
              {evaluatorList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Nilai (Slider & Numeric) */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 uppercase flex items-center gap-1.5">
              <Award size={16} className="text-amber-500" /> Skor Evaluasi Akhir
            </label>
            <span className="text-2xl font-black text-blue-600 font-mono">{score} / 100</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>0 (Kurang)</span>
            <span>50 (Cukup)</span>
            <span>75 (Baik)</span>
            <span>100 (Sangat Baik)</span>
          </div>
        </div>

        {/* Catatan Evaluasi */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
            Catatan / Rekomendasi Evaluasi
          </label>
          <textarea
            name="notes"
            rows={4}
            placeholder="Tuliskan umpan balik, pencapaian, atau aspek yang perlu ditingkatkan oleh anggota Satgas..."
            className="w-full border rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <Link
            href="/admin/assessments"
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {submitting ? "Menyimpan..." : "Simpan Evaluasi"}
          </button>
        </div>
      </form>
    </div>
  );
}