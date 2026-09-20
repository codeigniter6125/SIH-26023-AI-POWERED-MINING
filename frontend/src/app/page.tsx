import React from "react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          Smart India Hackathon 2026 • Problem ID: SIH26023
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          AI-Powered Geological &amp; Mining Intelligence Platform
        </h1>
        <p className="text-lg text-slate-400">
          Automated ingestion, OCR digitization, multi-agent reasoning, and report generation
          for CMPDI and Coal India Limited subsidiaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <h3 className="font-semibold text-lg text-amber-400">Document Ingestion</h3>
            <p className="text-sm text-slate-400">
              High-accuracy OCR for raster Geological Reports (GRs), borehole lithology logs, and multi-page tables.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <h3 className="font-semibold text-lg text-amber-400">Multi-Agent Intelligence</h3>
            <p className="text-sm text-slate-400">
              Router, Core Geological Analyst, and strict Validation Agents ensuring zero-hallucination answers.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <h3 className="font-semibold text-lg text-amber-400">Automated Reporting</h3>
            <p className="text-sm text-slate-400">
              One-click statutory CMPDI report generation, Q&amp;A summaries, and exportable PDF/Word outputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
