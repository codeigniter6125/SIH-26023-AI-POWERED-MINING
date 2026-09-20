"use client";

import React, { useState } from "react";
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Eye, 
  Layers, 
  Sparkles,
  Maximize2
} from "lucide-react";

interface IngestionDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IngestionDeskModal: React.FC<IngestionDeskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedRow, setSelectedRow] = useState<number>(2); // Default to Seam IX row
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const tableRows = [
    {
      id: 0,
      from: "0.00",
      to: "42.10",
      thickness: "42.10",
      stratum: "Alluvium and weathered zone",
      recovery: "62.5%",
      bbox: { x: 15, y: 35, w: 70, h: 10 },
    },
    {
      id: 1,
      from: "42.10",
      to: "114.28",
      thickness: "72.18",
      stratum: "Barakar Sandstone with shaly streaks",
      recovery: "88.4%",
      bbox: { x: 15, y: 46, w: 70, h: 10 },
    },
    {
      id: 2,
      from: "114.28",
      to: "122.70",
      thickness: "8.42",
      stratum: "★ Target Coal Seam IX (Grade G4)",
      recovery: "96.8%",
      bbox: { x: 15, y: 58, w: 70, h: 12 },
    },
    {
      id: 3,
      from: "122.70",
      to: "154.10",
      thickness: "31.40",
      stratum: "Interburden Hard Siliceous Shale",
      recovery: "92.1%",
      bbox: { x: 15, y: 71, w: 70, h: 10 },
    },
  ];

  const handleSimulatedUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setUploadSuccess(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#0c2340] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UploadCloud className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">
                Multi-Format Ingestion Desk &amp; Bounding-Box Evidence Viewer (PRD FR-13)
              </h3>
              <p className="text-xs text-slate-300">
                Automated OCR, tabular layout extraction, and coordinate bounding-box citation overlays
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Pane Studio */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-y-auto">
          {/* Left Pane: Upload Desk & Structured Extraction */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-[#0c2340] rounded-lg p-6 text-center space-y-2 bg-slate-50 transition-colors">
              <UploadCloud className="w-8 h-8 text-[#0c2340] mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Drop Scanned Geological PDF, Drill Book, or Wireline Curve Plate
              </div>
              <p className="text-[11px] text-slate-500">
                Supports Multi-page PDF, TIFF, PNG/JPG, and Excel/CSV (MECL, CMPDI, GSI archives)
              </p>
              <button
                onClick={handleSimulatedUpload}
                disabled={isProcessing}
                className="mt-2 px-3 py-1.5 bg-[#0c2340] hover:bg-[#081729] text-white text-xs font-semibold rounded disabled:opacity-50"
              >
                {isProcessing ? "Running Hybrid OCR Engine..." : "Select Document"}
              </button>
            </div>

            {/* Ingested File Card */}
            <div className="p-3 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <div>
                  <span className="font-bold text-slate-800">CMPDI_Block_IV_North_Karanpura_GR_2021.pdf</span>
                  <div className="text-[10px] text-slate-500">Page 12 · Table 3 · Confidence: 98.4%</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                EXTRACTED
              </span>
            </div>

            {/* Extracted Lithology Intervals Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Extracted Lithological Log Intervals
                </h4>
                <span className="text-[10px] text-slate-500">Click row to highlight bbox</span>
              </div>

              <div className="border border-[#d9e2ec] rounded-md overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                    <tr>
                      <th className="py-2 px-3">Interval (m)</th>
                      <th className="py-2 px-3">Thk</th>
                      <th className="py-2 px-3">Stratum</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tableRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRow(row.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedRow === row.id
                            ? "bg-amber-100 text-[#0c2340] font-bold"
                            : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-[11px]">{row.from} - {row.to}</td>
                        <td className="py-2 px-3">{row.thickness}m</td>
                        <td className="py-2 px-3 truncate max-w-[160px]">{row.stratum}</td>
                        <td className="py-2 px-3 text-right">
                          <button className="text-[10px] text-blue-700 underline">
                            View Box
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Pane: Scanned Plate Bounding Box Viewer */}
          <div className="p-6 bg-slate-900 text-white flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Scanned Document Canvas (Page 12 · Plate III)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Coordinates: [x: 140, y: 382, w: 320, h: 28]
              </span>
            </div>

            {/* Simulated Scanned Page with Real-Time Bounding Box Canvas Overlay */}
            <div className="relative my-4 flex-1 bg-slate-100 text-slate-900 p-6 rounded shadow-inner overflow-hidden font-serif border border-slate-600">
              {/* Document Header Text Simulation */}
              <div className="text-center border-b border-slate-400 pb-2 mb-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  CENTRAL MINE PLANNING &amp; DESIGN INSTITUTE LIMITED
                </div>
                <div className="text-[9px] text-slate-500">
                  REGIONAL INSTITUTE-II, RANCHI • GEOLOGICAL ASSESSMENT REPORT (BLOCK IV)
                </div>
              </div>

              <div className="text-[10px] space-y-2 text-slate-700">
                <p>
                  <strong>Table 3.4:</strong> Subsurface Lithological Intervals intercepted in Borehole <strong>BH-NK-094</strong>,
                  Tandwa Sector. Wireline logging executed with dual-detector gamma ray &amp; sonic caliper tool.
                </p>

                {/* Simulated Tabular Graphic */}
                <div className="space-y-1 pt-2 font-mono text-[9px]">
                  <div className="text-slate-400 border-b border-slate-300 pb-1 flex justify-between">
                    <span>DEPTH (FROM - TO)</span>
                    <span>THICKNESS</span>
                    <span>STRATA DESCRIPTION</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>00.00m - 42.10m</span>
                    <span>42.10m</span>
                    <span>Alluvium, sub-rounded gravels</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>42.10m - 114.28m</span>
                    <span>72.18m</span>
                    <span>Barakar medium sandstone</span>
                  </div>
                  <div className="flex justify-between py-0.5 font-bold text-slate-900">
                    <span>114.28m - 122.70m</span>
                    <span>08.42m</span>
                    <span>SEAM IX (Vitrain Coal Horizon)</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>122.70m - 154.10m</span>
                    <span>31.40m</span>
                    <span>Siliceous Shale Interburden</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Coordinate Bounding Box Overlay */}
              {tableRows[selectedRow] && (
                <div
                  className="absolute border-2 border-amber-500 bg-amber-500/20 rounded shadow-md pointer-events-none transition-all duration-300"
                  style={{
                    left: `${tableRows[selectedRow].bbox.x}%`,
                    top: `${tableRows[selectedRow].bbox.y}%`,
                    width: `${tableRows[selectedRow].bbox.w}%`,
                    height: `${tableRows[selectedRow].bbox.h}%`,
                  }}
                >
                  <span className="absolute -top-4 left-0 bg-amber-500 text-black text-[9px] font-mono font-bold px-1 rounded">
                    BBOX: Row {selectedRow + 1}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700 pt-3">
              <span>SHA-256 Hash: 9f83c1b894101e4a32e18502f9c45a7d...</span>
              <span className="text-emerald-400 font-semibold">Matched to CMPDI 2021 Plate III</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {uploadSuccess ? "✓ Document successfully parsed and indexed into ChromaDB vector store." : "Select row to review precise coordinate bounding-box."}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0c2340] hover:bg-[#081729] text-white text-xs font-semibold rounded-md shadow"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
