"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Building2,
  Users,
  LayoutDashboard,
  Landmark,
  UtensilsCrossed,
  Store,
} from "lucide-react";

export default function RootLandingPage() {
  const renderCard = (title: string, desc: string, Icon: any, role: string, hoverClass: string, textClass: string) => {
    return (
      <Link href={`/login?role=${role}`} className="h-full w-full">
        <Card className={`bg-zinc-900 border-zinc-800 transition-all cursor-pointer group h-full w-full relative ${hoverClass}`}>
          <CardHeader className="pb-8 pt-8 text-center px-6">
            <div className={`mb-6 group-hover:scale-105 transition-transform flex justify-center ${textClass}`}>
              <Icon size={44} />
            </div>
            <CardTitle className="text-white text-base md:text-lg text-center">{title}</CardTitle>
            <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">{desc}</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    );
  };

  return (
    <main className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 md:p-16 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none mix-blend-luminosity" 
        style={{ backgroundImage: "url('/distributor-bg.jpeg')" }} 
      />
      <div className="fixed inset-0 z-0 bg-black/70 pointer-events-none" />
      <div className="relative z-10 w-full mx-auto space-y-16 px-4 max-w-7xl">
          <div className="space-y-4 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 flex items-center justify-center rounded-lg shadow-md shadow-blue-500/20">
                  <img src="/logo-round.png" alt="VendorLock Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              VendorLock AI
            </h1>
            <p className="text-zinc-300 text-sm md:text-base">
              Trade Intelligence & Risk Management Platform
            </p>
            <p className="text-emerald-400 text-sm font-semibold animate-pulse mt-4">
              Click any role below to log in with prefilled mock credentials
            </p>
          </div>

        <div className="flex justify-center w-full px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-max w-full max-w-4xl">
            {renderCard("Distributor", "Control Tower & Beat Intelligence", LayoutDashboard, "distributor", "hover:border-blue-500", "text-blue-500")}
            {renderCard("Company", "Policy Management & Oversight", Building2, "company", "hover:border-purple-500", "text-purple-500")}
            {renderCard("Salesman", "On-field Intelligence & Execution", Users, "agent", "hover:border-green-500", "text-green-500")}
            {renderCard("NBFC / Lender", "Credit Risk, Collections & Portfolio View", Landmark, "nbfc", "hover:border-amber-500", "text-amber-500")}
            {renderCard("HORECA Buyer", "Purchase Planning, Fill Rate & Supplier Insights", UtensilsCrossed, "horeca", "hover:border-orange-500", "text-orange-500")}
            {renderCard("Retailer Dashboard", "Kirana Operations, Inventory Health & Reorder Signals", Store, "retailer", "hover:border-cyan-500", "text-cyan-500")}
          </div>
        </div>

        <div className="pt-20 text-zinc-600 text-xs tracking-wide text-center w-full">
          &copy; 2026 VendorLock AI. All rights reserved.
        </div>
      </div>
    </main>
  );
}
