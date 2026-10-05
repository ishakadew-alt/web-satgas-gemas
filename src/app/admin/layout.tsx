import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { Trophy } from "lucide-react";

// Di dalam daftar menu sidebar:
<Link
  href="/admin/leaderboard"
  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
>
  <Trophy size={16} className="text-amber-500" />
  <span>Leaderboard Satgas</span>
</Link>

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}