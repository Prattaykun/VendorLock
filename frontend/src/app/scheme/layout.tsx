"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SchemeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-slate-800 bg-slate-950 flex flex-col py-8 z-[60] shadow-2xl shadow-blue-900/10">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4d8eff] flex items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-[#001a42]">security</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-blue-500 leading-none">VendorLock</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/scheme/upload"
            className={`flex items-center gap-4 transition-all duration-200 ease-in-out font-inter text-[13px] font-medium py-3 px-6 ${
              pathname === "/scheme/upload"
                ? "bg-blue-500/10 text-blue-500 border-r-2 border-blue-500"
                : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-50"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "FILL 1" }}>
              security
            </span>
            <span>Scheme Management</span>
          </Link>
          <Link
            href="/scheme/analytics"
            className={`flex items-center gap-4 transition-all duration-200 ease-in-out font-inter text-[13px] font-medium py-3 px-6 ${
              pathname === "/scheme/analytics"
                ? "bg-blue-500/10 text-blue-500 border-r-2 border-blue-500"
                : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-50"
            }`}
          >
            <span className="material-symbols-outlined">insights</span>
            <span>Analytics</span>
          </Link>
        </nav>

        <div className="mt-auto px-6 space-y-4">
          <button className="w-full bg-[#adc6ff] text-[#001a42] py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all active:scale-95">
            Add New Scheme
          </button>
          <div className="pt-6 border-t border-slate-800 space-y-1 -mx-6">
            <a
              href="#"
              className="flex items-center gap-4 transition-all duration-200 ease-in-out font-inter text-[13px] font-medium text-slate-400 py-3 px-6 hover:bg-slate-900/50 hover:text-slate-50"
            >
              <span className="material-symbols-outlined">help</span>
              <span>Support</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-4 transition-all duration-200 ease-in-out font-inter text-[13px] font-medium text-slate-400 py-3 px-6 hover:bg-slate-900/50 hover:text-slate-50"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 right-0 z-50 flex items-center justify-between px-6 h-16 w-[calc(100%-288px)] ml-auto bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 shadow-none">
        <div className="flex items-center flex-1">
          <div className="relative w-96 max-w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="w-full bg-slate-800/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500"
              placeholder="Search parameters, nodes, or distributors..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:bg-slate-800/50 hover:text-blue-400 transition-colors rounded-full active:scale-95 duration-150">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-800/50 hover:text-blue-400 transition-colors rounded-full active:scale-95 duration-150">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-700 ml-2">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcS5F4JO9j94pDeKKAuzZtx170XnbeGB9pqMcp6dhTIgPj7sZciq4LoWKQ-ixDmfjuPDnk6gC7XxjD-juZe75BxNpU9OW1VuCT1c0terDAhQAW5317foD-xc4XTfEGhyreYH45Ntl9-HwG6I_YKYxLe4dTo_auHlrQRJUvxMb7hjjIpFLUlKFryraH_4vJ2nYmv1_g8G9WS_YMUGgxji1gjPfajhxUv9xpFkF9m-Qmoc58ZeuZ1zOzEsn9IGmMozj0VaItoQi_"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pl-72 pr-8 pb-12 relative min-h-screen">
        {/* Background Image Overlay */}
        <div className="fixed inset-0 z-[-1] opacity-10 grayscale pointer-events-none">
          <img
            alt="Logistics Network"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuABQgnU1DISF7kN47LCvTSsxwPPTMu63avqK8sWEdqpIcBnZ82BhQmjyLx9g_uC9-yVASSRzOoFJ8a_-u5Ht_fAschQoSXaAy1T2QD6bH-K7juNXEo6nXjXQMllAH-Jhmcm32BIIO-RUqfPYOSJ9dE7zzZkSYfRi5EkUtYQej3_xbtmRrJNmJRDGwfparbh2JAsemkOWsCgx8GjaZUyb-lHn1Lqd19tVE3tngbCvbSgSmM69o56A3NKgj6C5M9TTC7NgVbN80Nl"
          />
        </div>

        {children}
      </main>
    </div>
  );
}
