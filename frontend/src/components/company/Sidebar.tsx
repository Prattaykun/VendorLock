import Link from "next/link";
import { LayoutDashboard, FileText, BarChart3, Settings, Users } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0B1221] border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg shadow-lg flex items-center justify-center">
            <img src="/logo-round.png" alt="Logo" className="w-6 h-6 object-cover" />
          </div>
          <span className="text-xl font-black text-[#d8e3fb] tracking-tight">VendorLock</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 ml-11 uppercase font-bold tracking-wider">Brand HQ</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/company" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
          <LayoutDashboard className="w-5 h-5" />
          Overview
        </Link>
        <Link href="/scheme/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors">
          <FileText className="w-5 h-5" />
          Scheme Management
        </Link>
        <Link href="/scheme/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors">
          <BarChart3 className="w-5 h-5" />
          Analytics
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors">
          <Users className="w-5 h-5" />
          Distributors
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors opacity-50 cursor-not-allowed">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
