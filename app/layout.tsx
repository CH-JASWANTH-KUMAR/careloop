import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CareContinuityBanner } from "@/components/shared/CareContinuityBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareLoop | Family Health Coordination Platform",
  description:
    "AI-powered family healthcare coordination. Understand, coordinate, execute, and confirm healthcare administrative workflows for elderly parents and distributed families.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        <AppProvider>
          <div className="flex min-h-screen">
            {/* Desktop Operational Sidebar */}
            <Sidebar />

            {/* Main Application Column */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
              <Header />
              <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
                <CareContinuityBanner />
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </AppProvider>
      </body>
    </html>
  );
}
