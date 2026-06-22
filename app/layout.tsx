import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "./lib/DataContext";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SISTEMATIZAÊ · Painel de Mídia",
  description:
    "Dashboard de performance de mídia do programa SISTEMATIZAÊ — Governo da Bahia / SECOM.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DataProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 min-w-0 md:pl-[248px]">
              <Topbar />
              <main className="px-4 md:px-8 pb-16 pt-4 max-w-[1500px] mx-auto">
                {children}
              </main>
            </div>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
