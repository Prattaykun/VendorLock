"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  UtensilsCrossed, 
  Truck, 
  History, 
  Settings,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/horeca", color: "text-orange-400" },
  { icon: ShoppingCart, label: "Procurement", href: "/horeca/procure", color: "text-blue-400" },
  { icon: Truck, label: "Suppliers", href: "/horeca/suppliers", color: "text-emerald-400" },
  { icon: History, label: "Order History", href: "/horeca/history", color: "text-purple-400" },
  { icon: CreditCard, label: "Payments", href: "/horeca/payments", color: "text-amber-400" },
  { icon: Settings, label: "Settings", href: "/horeca/settings", color: "text-slate-400" },
];

export default function HorecaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0B1221] border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center border border-orange-500/30">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block">HORECA</span>
            <span className="text-[10px] text-orange-400/80 font-bold uppercase tracking-widest -mt-1 block">Buyer Portal</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? item.color : "text-slate-500"
              )} />
              <span className="text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Usage Credits</p>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-orange-500 w-[75%] rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-300 font-medium">84 / 100 API Credits</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
