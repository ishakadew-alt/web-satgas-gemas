"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Trophy,
  LogOut,
  FolderTree,
  FileCheck2
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const superadminMenu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manajemen User", href: "/admin/users", icon: Users },
    { name: "Data Klaster", href: "/admin/clusters", icon: FolderTree },
    { name: "Aspek Penilaian", href: "/admin/assessments", icon: ClipboardList },
    { name: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  ];

  const facilitatorMenu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Penilaian Satgas", href: "/dashboard/penilaian", icon: FileCheck2 },
    { name: "Rekapitulasi", href: "/dashboard/rekapitulasi", icon: ClipboardList },
    { name: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  ];

  const satgasMenu = [
    { name: "Dashboard", href: "/satgas/dashboard", icon: LayoutDashboard },
    { name: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  ];

  const menus =
    role === "SUPERADMIN"
      ? superadminMenu
      : role === "FACILITATOR"
      ? facilitatorMenu
      : role === "SATGAS"
      ? satgasMenu
      : [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">Satgas GEMAS</h1>
      </div>

      <div className="p-4 mb-2 bg-slate-50 border-b border-gray-100">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Role Akun
        </p>
        <p className="text-sm font-bold text-indigo-700 mt-0.5">{role || "Memuat..."}</p>
        <p className="text-xs text-gray-600 font-medium truncate mt-0.5">
          {(session?.user as any)?.name}
        </p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menus.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3 text-red-500" />
          Keluar
        </button>
      </div>
    </aside>
  );
}