import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    if (path === "/dashboard") {
      return NextResponse.next();
    }

    // Proteksi Jalur ADMIN & DASHBOARD UTAMA
    if (path.startsWith("/admin")) {
      // Izinkan FACILITATOR mengakses Dashboard Utama dan Leaderboard
      if (
        (path === "/admin/dashboard" || path === "/admin/leaderboard") &&
        (role === "SUPERADMIN" || role === "FACILITATOR")
      ) {
        return NextResponse.next();
      }
      if (role !== "SUPERADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Proteksi Jalur FACILITATOR
    if (
      (path.startsWith("/dashboard/facilitator") ||
        path.startsWith("/dashboard/penilaian") ||
        path.startsWith("/dashboard/rekapitulasi")) &&
      role !== "FACILITATOR" &&
      role !== "SUPERADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Proteksi Jalur SATGAS
    if (path.startsWith("/satgas") && role !== "SATGAS" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/satgas/:path*"],
};