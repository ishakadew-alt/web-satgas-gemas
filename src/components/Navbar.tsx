"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white font-bold p-2 rounded-lg text-sm tracking-wide">
          GEMAS
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-sm">Satgas GEMAS</h1>
          <p className="text-[11px] text-gray-500">Sistem Evaluasi & Monitoring</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-gray-800 flex items-center justify-end gap-1.5">
            <UserIcon size={14} className="text-blue-600" />
            {session.user.name}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-end gap-2 mt-0.5">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
              {session.user.role}
            </span>

            {/* Badge level HANYA muncul untuk SATGAS */}
            {session.user.role === "SATGAS" && session.user.level && (
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                {session.user.level.replace("_", " ")}
              </span>
            )}

            <span className="font-mono text-[11px] text-gray-400">
              NIP: {session.user.nip}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition border border-red-100"
          title="Keluar dari akun"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}