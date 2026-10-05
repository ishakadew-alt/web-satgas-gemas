import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MainDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  switch (role) {
    case "SUPERADMIN":
    case "FACILITATOR":
      // SUPERADMIN dan FACILITATOR sama-sama masuk ke Dashboard Utama
      redirect("/admin/dashboard");
      break;
    case "SATGAS":
      redirect("/satgas/dashboard");
      break;
    default:
      redirect("/login");
  }
}