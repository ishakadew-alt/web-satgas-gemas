"use client";

import { useState, useEffect } from "react";
import {
  getClustersData,
  createCluster,
  updateCluster,
  deleteCluster,
} from "@/app/actions/cluster";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  X,
  Check,
} from "lucide-react";

export default function ClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingCluster, setEditingCluster] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);
    const data = await getClustersData();
    setClusters(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (cluster: any = null) => {
    setEditingCluster(cluster);
    setErrorMsg("");
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setEditingCluster(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    let res;

    if (editingCluster) {
      res = await updateCluster(editingCluster.id, formData);
    } else {
      res = await createCluster(formData);
    }

    if (res.success) {
      handleCloseModal();
      loadData();
    } else {
      setErrorMsg(res.error || "Terjadi kesalahan.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Klaster "${name}"?`)) {
      const res = await deleteCluster(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error);
      }
    }
  };

  const filteredClusters = clusters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-600" size={22} />
            Manajemen Klaster
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola wilayah kerja dan pengerahan tim Satgas
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm"
        >
          <Plus size={16} /> Tambah Klaster Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari klaster..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        />
      </div>

      {/* Grid Cards Klaster */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">
          Memuat data klaster...
        </div>
      ) : filteredClusters.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-xl border">
          Belum ada data klaster.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-800 text-sm">
                    {cluster.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(cluster)}
                      className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cluster.id, cluster.name)}
                      className="p-1.5 hover:bg-red-50 rounded-md text-gray-500 hover:text-red-600 transition"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {cluster.description || "Tidak ada deskripsi wilayah."}
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  <Users size={14} />
                  {cluster._count?.users || 0} Anggota Satgas
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-800 text-sm">
                {editingCluster ? "Edit Klaster" : "Tambah Klaster Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nama Klaster *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCluster?.name || ""}
                  placeholder="Contoh: Klaster Barat 1 / Wilayah Kudus"
                  required
                  className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Deskripsi / Wilayah Kerja
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingCluster?.description || ""}
                  placeholder="Deskripsi tugas atau lokasi cakupan klaster..."
                  className="w-full border rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  <Check size={14} />
                  {submitting ? "Memproses..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}