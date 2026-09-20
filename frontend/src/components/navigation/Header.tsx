"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  Database, 
  UploadCloud, 
  ShieldCheck, 
  UserCheck, 
  Activity,
  AlertTriangle
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openIngestionModal: () => void;
  discrepancyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openIngestionModal,
  discrepancyCount = 2,
}) => {
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [language, setLanguage] = useState<"EN" | "HI">("EN");

  const handleFontSizeChange = (size: "sm" | "md" | "lg") => {
    setFontSize(size);
    if (typeof document !== "undefined") {
      document.body.className = `font-size-${size}`;
    }
  };

  const navItems = [
    { id: "dashboard", label: language === "EN" ? "1. Dashboard" : "१. डैशबोर्ड", icon: Activity },
    { id: "boreholes", label: language === "EN" ? "2. Borehole Directory" : "२. बोरहोल निर्देशिका", icon: Layers },
    { id: "maps", label: language === "EN" ? "3. Block Exploration Maps" : "३. ब्लॉक अन्वेषण मानचित्र", icon: MapPin },
    { id: "reports", label: language === "EN" ? "4. Geological Reports" : "४. भूवैज्ञानिक रिपोर्ट", icon: FileText },
    { 
      id: "verification", 
      label: language === "EN" ? "5. Verification Queue" : "५. सत्यापन कतार", 
      icon: CheckCircle2,
      badge: discrepancyCount 
    },
    { id: "repository", label: language === "EN" ? "6. National Data Repository" : "६. राष्ट्रीय डेटा भंडार", icon: Database },
  ];

  return (
    <header className="w-full bg-white border-b border-[#d9e2ec] select-none sticky top-0 z-40 shadow-sm">
      {/* 1. Government of India Tricolor Top Bar */}
      <div className="gov-tricolor-stripe w-full" />

      {/* 2. GIGW 3.0 Top Utility Access Bar */}
      <div className="bg-[#081729] text-slate-300 text-xs py-1 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-slate-200">
            {language === "EN" ? "भारत सरकार | Government of India" : "भारत सरकार | Government of India"}
          </span>
          <span className="text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            {language === "EN" ? "Ministry of Coal • CMPDI & CIL Subsidiaries" : "कोयला मंत्रालय • सीएमपीडीआई और सीआईएल"}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Text Size Accessibility Controls */}
          <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 mr-1">Text:</span>
            <button
              onClick={() => handleFontSizeChange("sm")}
              className={`px-1 rounded text-xs font-semibold ${fontSize === "sm" ? "text-amber-400 bg-slate-700" : "text-slate-300 hover:text-white"}`}
              title="Decrease text size"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSizeChange("md")}
              className={`px-1 rounded text-xs font-semibold ${fontSize === "md" ? "text-amber-400 bg-slate-700" : "text-slate-300 hover:text-white"}`}
              title="Default text size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange("lg")}
              className={`px-1 rounded text-xs font-semibold ${fontSize === "lg" ? "text-amber-400 bg-slate-700" : "text-slate-300 hover:text-white"}`}
              title="Increase text size"
            >
              A+
            </button>
          </div>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setLanguage(language === "EN" ? "HI" : "EN")}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
          >
            {language === "EN" ? "हिन्दी" : "English"}
          </button>

          {/* GIGW 3.0 Standard Badge */}
          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GIGW 3.0 Compliant</span>
          </div>
        </div>
      </div>

      {/* 3. Official Ministry & CMPDI Masthead */}
      <div className="bg-[#0c2340] text-white px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Ashoka Emblem Emblem / Government Insignia */}
          <div className="w-12 h-12 bg-white rounded-md p-1 flex items-center justify-center border border-amber-500/30 shadow-inner flex-shrink-0">
            <div className="text-center font-serif text-[#0c2340] leading-none">
              <span className="text-[9px] font-bold block tracking-tighter">सत्यमेव</span>
              <span className="text-[12px] font-extrabold block">जयते</span>
              <span className="text-[7px] text-slate-500 font-sans block mt-0.5">GOI</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Coal India Limited / CMPDI
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono">
                SIH26023
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              CMPDI Geological Intelligence &amp; Exploration Records Portal
            </h1>
            <p className="text-xs text-slate-300 hidden sm:block">
              National Coal Inventory Automation, Source-Traceable AI Workflow &amp; Statutory Dossiers
            </p>
          </div>
        </div>

        {/* Action Controls: Officer Badge & Ingestion Desk Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={openIngestionModal}
            className="flex items-center space-x-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-md shadow transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingestion Desk (OCR)</span>
          </button>

          {/* Authenticated Officer Badge per PRD */}
          <div className="hidden md:flex items-center space-x-2.5 bg-[#081729] px-3 py-1.5 rounded-md border border-slate-700">
            <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-left leading-none">
              <div className="text-xs font-semibold text-white">Er. S. Mukhopadhyay</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Chief Geologist | RI-II Ranchi</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Primary Navigation Bar (6 Core Tabs) */}
      <nav className="bg-slate-100 border-b border-[#d9e2ec] px-4 sm:px-8 overflow-x-auto">
        <div className="flex items-center space-x-1 sm:space-x-2 py-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors relative ${
                  isActive
                    ? "bg-white text-[#0c2340] border-t-2 border-[#0c2340] font-bold shadow-sm"
                    : "text-[#4b5563] hover:text-[#0c2340] hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#0c2340]" : "text-slate-500"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
