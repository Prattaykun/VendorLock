"use client";

import { useState } from "react";

export default function UploadSchemePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [sendToDistributors, setSendToDistributors] = useState(false);
  const [sendToRetailers, setSendToRetailers] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 space-y-10">
      {/* Header */}
      <header className="mb-10 max-w-3xl">
        <h2 className="font-headline-lg text-[30px] leading-[38px] font-semibold text-[#d8e3fb] mb-3 tracking-tight">
          Upload New Scheme
        </h2>
        <p className="text-slate-400 font-body-md leading-7 max-w-2xl">
          Configure and deploy new distribution incentives across the network.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        {/* Left Column: File Upload & Targets */}
        <div className="lg:col-span-7 space-y-8">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-xl p-12 border-2 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500/50 bg-blue-500/10"
                : "border-slate-800 bg-slate-950/60 hover:border-blue-500/50"
            }`}
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#adc6ff] text-3xl">upload_file</span>
            </div>
            <h3 className="font-semibold text-[24px] leading-[32px] text-slate-100 mb-3 tracking-tight">Drop scheme document here</h3>
            <p className="text-slate-400 text-sm leading-6 mb-8 max-w-sm">
              Supports PDF, XLSX, and CSV files containing SKU lists and discount structures.
            </p>
            <button className="bg-[#152031] border border-slate-700 text-slate-200 px-6 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors">
              Browse Local Storage
            </button>
          </div>

          {/* Target Selector */}
          <div
            className="rounded-xl p-8 border border-slate-800"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h4 className="font-semibold text-[12px] leading-[16px] text-blue-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">hub</span>
              Network Distribution Targets
            </h4>
            <div className="space-y-8">
              {/* Distributors */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sendToDistributors}
                    onChange={(e) => setSendToDistributors(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-200 font-semibold">Send to Distributors</span>
                </label>
                <div className="relative pl-8">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                  <select className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-blue-500">
                    <option>All Network Distributors (Default)</option>
                    <option>Specific Regions Only...</option>
                    <option>Platinum Tier Only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Retailers */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sendToRetailers}
                    onChange={(e) => setSendToRetailers(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-200 font-semibold">Send to Retailers</span>
                </label>
                <div className="relative pl-8">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                  <select className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-blue-500">
                    <option>All in Network</option>
                    <option>Urban Tier 1 Nodes</option>
                    <option>Rural Express Nodes</option>
                    <option>Custom Selection...</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div
            className="rounded-xl p-8 border border-slate-800 flex-1 flex flex-col"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-10 gap-4">
              <h4 className="font-semibold text-[12px] leading-[16px] text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">psychology</span>
                Intelligence Insight
              </h4>
              <button className="flex items-center gap-2 bg-blue-500 text-[#001a42] px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "FILL 1" }}>
                  auto_awesome
                </span>
                Generate AI Summary
              </button>
            </div>

            <div className="flex-1 rounded-xl bg-slate-950/50 border border-slate-800/50 p-8 relative overflow-hidden">
              {/* Background Pulse for AI */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-blue-500 animate-pulse">monitoring</span>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-slate-300 font-body-md leading-8 italic">
                    "Analysis pending... Upload document to extract core scheme intelligence including SKU profitability impact and regional benefit spreads."
                  </p>
                </div>

                {/* Dummy Preview State */}
                <div className="mt-10 space-y-6 opacity-30 select-none blur-[1px]">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Scheme Details</p>
                    <p className="text-sm text-slate-200">Q3 Monsoon Multi-Tier Distribution Incentive</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Target SKUs</p>
                      <p className="text-sm text-blue-500 font-mono-data">EL-402, EL-901, X-PR0</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Benefit %</p>
                      <p className="text-sm text-blue-500 font-mono-data">14.5% Avg. Margin</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Validity Period</p>
                    <p className="text-sm text-slate-200">July 01 - September 30, 2024</p>
                  </div>
                </div>
              </div>

              {/* Decorative Progress Tracker */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div className="h-full bg-blue-500 w-1/4"></div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-10">
              <button className="w-full bg-slate-100 text-slate-950 h-16 rounded-xl flex items-center justify-center gap-3 font-black text-lg shadow-xl shadow-blue-500/10 hover:bg-white active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "FILL 1" }}>
                  send
                </span>
                Send via Telegram
              </button>
              <p className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                Immediate dispatch to 1,240 verified network nodes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Status Bar */}
      <div
        className="mt-16 rounded-xl border border-slate-800/50 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 lg:px-10"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex flex-wrap items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono-data text-slate-400">CORE SYSTEM: OPTIMAL</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-blue-500">lan</span>
            <span className="text-xs font-mono-data text-slate-400">SECURE UPLOAD TUNNEL ACTIVATED</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="material-symbols-outlined text-xs">history</span>
          Last scheme deployed 14h ago
        </div>
      </div>
    </div>
  );
}
