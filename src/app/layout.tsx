import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard Pemantauan Bersepadu JTM",
  description:
    "Sistem Dashboard Pemantauan Bersepadu — Jabatan Tenaga Manusia (JTM), Kementerian Sumber Manusia Malaysia. Pemantauan operasi ILP/IKM secara real-time.",
  keywords: [
    "JTM",
    "Jabatan Tenaga Manusia",
    "ILP",
    "IKM",
    "Dashboard",
    "Pemantauan Bersepadu",
    "Malaysia",
  ],
  authors: [{ name: "Jabatan Tenaga Manusia (JTM)" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-jtm-bg text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
