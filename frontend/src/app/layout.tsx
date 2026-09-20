import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoMine AI | Geological & Mining Decision Intelligence",
  description:
    "AI-powered Geological, Mining, and Reporting Solution for CMPDI / Coal India Limited (SIH26023)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased font-sans">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center font-bold text-black">
                GM
              </div>
              <span className="font-semibold text-lg tracking-tight">
                GeoMine AI <span className="text-xs text-amber-400 font-mono">SIH26023</span>
              </span>
            </div>
            <nav className="flex items-center space-x-6 text-sm text-slate-300">
              <a href="/" className="hover:text-amber-400 transition-colors">Dashboard</a>
              <a href="/documents" className="hover:text-amber-400 transition-colors">Documents</a>
              <a href="/chat" className="hover:text-amber-400 transition-colors">AI Assistant</a>
              <a href="/visualizer" className="hover:text-amber-400 transition-colors">Visualizer</a>
              <a href="/reports" className="hover:text-amber-400 transition-colors">Reports</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
