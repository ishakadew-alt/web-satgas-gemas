"use client"; // Wajib untuk komponen yang interaktif (ada form login)

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Memanggil sistem login NextAuth yang kita buat sebelumnya
    const result = await signIn("credentials", {
      nip,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("NIP atau Kata Sandi salah!");
    } else {
      // Jika sukses, sementara kita arahkan ke halaman dasbor (yang akan kita buat nanti)
      router.push("/dashboard"); 
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Bagian Kiri (Informasi) */}
        <div className="bg-blue-700 text-white p-10 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold mb-2">Portal Narotama</h1>
          <p className="text-blue-200 mb-8 font-medium">Sistem Penilaian & Leaderboard Satgas GEMAS</p>
          <div className="space-y-4">
            <div className="bg-blue-800/50 p-4 rounded-lg border border-blue-600">
              <h3 className="font-bold text-sm text-blue-300 uppercase tracking-wider mb-1">Tingkat Saat Ini</h3>
              <p className="text-xl font-semibold flex items-center gap-2">🌱 Tingkat Wijil</p>
            </div>
          </div>
        </div>

        {/* Bagian Kanan (Form Login Aktif) */}
        <div className="p-10 md:w-1/2 flex flex-col justify-center bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Masuk ke Sistem</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP Pegawai</label>
              <input 
                type="text" 
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Masukkan NIP (Contoh: ADMIN001)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}