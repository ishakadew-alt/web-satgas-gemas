"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/user";
import { 
  Plus, Search, Edit2, Trash2, Shield, 
  MapPin, Award, X, Eye 
} from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formRole, setFormRole] = useState("SATGAS");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.users || []);
      setClusters(data.clusters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (user: any = null) => {
    setSelectedUser(user);
    setFormRole(user ? user.role : "SATGAS");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (selectedUser) {
      await updateUser(selectedUser.id, formData);
    } else {
      await createUser(formData);
    }

    handleCloseModal();
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah kamu yakin ingin menghapus user ${name}?`)) {
      await deleteUser(id);
      loadData();
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.nip?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchLevel = levelFilter === "ALL" || u.level === levelFilter;
    return matchSearch && matchRole && matchLevel;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola akun Superadmin, Fasilitator, dan Satgas GEMAS.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIP atau Nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Role</option>
          <option value="SUPERADMIN">SUPERADMIN</option>
          <option value="FACILITATOR">FACILITATOR</option>
          <option value="SATGAS">SATGAS</option>
        </select>

        {/* Filter 5 Level Satgas */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Level Satgas</option>
          <option value="WIJIL">WIJIL</option>
          <option value="MADYA">MADYA</option>
          <option value="NARAYA">NARAYA</option>
          <option value="SUWAWANA">SUWAWANA</option>
          <option value="JANA_UTAMA">JANA UTAMA</option>
        </select>
      </div>

      {/* Table User */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data user...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                  <th className="p-4">User</th>
                  <th className="p-4">NIP</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Cluster / Wilayah</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400">
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-medium text-gray-900">{user.name}</td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{user.nip}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.role === "SUPERADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "FACILITATOR"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <Shield size={12} /> {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.role === "SATGAS" && user.level ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Award size={12} /> {user.level.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {user.cluster ? (
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin size={12} className="text-gray-400" />
                            {user.cluster.name} ({user.cluster.wilayah})
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1.5 inline-block hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition"
                          title="Lihat Detail Laporan"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 hover:bg-gray-100 text-blue-600 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="Hapus User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-800">
                {selectedUser ? "Edit Data User" : "Tambah User Baru"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedUser?.name || ""}
                  required
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  NIP / ID Login
                </label>
                <input
                  type="text"
                  name="nip"
                  defaultValue={selectedUser?.nip || ""}
                  required
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Password {selectedUser && "(Kosongkan jika tidak diganti)"}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={selectedUser ? "••••••••" : "Default: password123"}
                  required={!selectedUser}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="SATGAS">SATGAS</option>
                    <option value="FACILITATOR">FACILITATOR</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                </div>

                {formRole === "SATGAS" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Level Satgas
                    </label>
                    <select
                      name="level"
                      defaultValue={selectedUser?.level || "WIJIL"}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="WIJIL">WIJIL</option>
                      <option value="MADYA">MADYA</option>
                      <option value="NARAYA">NARAYA</option>
                      <option value="SUWAWANA">SUWAWANA</option>
                      <option value="JANA_UTAMA">JANA UTAMA</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Penempatan Cluster
                </label>
                <select
                  name="clusterId"
                  defaultValue={selectedUser?.clusterId || ""}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Tanpa Cluster --</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.wilayah})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}