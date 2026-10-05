import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Satgas GEMAS",
  description: "Sistem Evaluasi & Monitoring Satgas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}