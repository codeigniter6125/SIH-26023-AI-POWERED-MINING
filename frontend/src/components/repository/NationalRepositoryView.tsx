"use client";

import React from "react";
import { 
  Database, 
  Download, 
  ShieldCheck, 
  FileCheck, 
  Award, 
  ExternalLink,
  Layers,
  Printer
} from "lucide-react";

export const NationalRepositoryView: React.FC = () => {
  const registers = [
    {
      id: "FORM-V-NK-094",
      title: "Statutory Form-V Exploration Register: BH-NK-094",
      regulation: "Coal Mines Regulations (CMR) 2017 — Reg. 113",
      issuedBy: "CMPDI Regional Institute II, Ranchi",
      date: "14-Oct-2021",
      clearanceStatus: "DGMS_CLEARED",
      docketNo: "SEC-IV/2025/OK/094",
    },
    {
      id: "FORM-V-NK-091",
      title: "Statutory Form-V Exploration Register: BH-NK-091",
      regulation: "Coal Mines Regulations (CMR) 2017 — Reg. 113",
      issuedBy: "CMPDI Regional Institute II, Ranchi",
      date: "10-Sep-2021",
      clearanceStatus: "DGMS_CLEARED",
      docketNo: "SEC-IV/2025/OK/091",
    },
    {
      id: "UNFC-111-BLOCK-IV",
      title: "UNFC 111 Proved Geological Reserves Statement — Block IV",
      regulation: "United Nations Framework Classification (111 Proved)",
      issuedBy: "Ministry of Coal / CMPDI Headquarters",
      date: "02-Jan-2026",
      clearanceStatus: "DGMS_CLEARED",
      docketNo: "MOC/UNFC/NK-IV/2026",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#d9e2ec] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#0c2340]" />
            <h2 className="font-bold text-base text-[#0c2340]">
              National Data Repository (Form-V &amp; DGMS Safety Archive)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory exploration registers, CMR 2017 Regulation 113 clearances, and UNFC 111 reserve categorization
          </p>
        </div>

        <button 
          onClick={() => alert("Batch exporting all certified Form-V registers...")}
          className="px-3.5 py-2 bg-[#0c2340] hover:bg-[#081729] text-white text-xs font-bold rounded-md shadow flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Batch Print All Registers</span>
        </button>
      </div>

      {/* 2. Repository Registers Table */}
      <div className="bg-white rounded-lg border border-[#d9e2ec] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c2340] text-white uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Register Title</th>
                <th className="py-3 px-4">Statutory Clause</th>
                <th className="py-3 px-4">Certifying Authority</th>
                <th className="py-3 px-4">Docket Number</th>
                <th className="py-3 px-4">Clearance Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e2ec]">
              {registers.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0c2340]">{reg.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {reg.id}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{reg.regulation}</td>
                  <td className="py-3 px-4 text-slate-600">{reg.issuedBy}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-800">{reg.docketNo}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      DGMS Cleared
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button 
                      onClick={() => alert(`Downloading statutory docket: ${reg.docketNo}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#0c2340] hover:text-white rounded text-slate-700 font-semibold transition-colors inline-flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
