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
          </div>

        <div className="flex justify-center w-full px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-max w-full max-w-4xl">
            <Link href="/distributor">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500 transition-all cursor-pointer group h-full w-full">
                <CardHeader className="pb-8 pt-8 text-center px-6">
                  <div className="mb-6 text-blue-500 group-hover:scale-105 transition-transform flex justify-center">
                    <LayoutDashboard size={44} />
                  </div>
                  <CardTitle className="text-white text-base md:text-lg text-center">Distributor</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">Control Tower & Beat Intelligence</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/company">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500 transition-all cursor-pointer group h-full w-full">
                <CardHeader className="pb-8 pt-8 text-center px-6">
                  <div className="mb-6 text-purple-500 group-hover:scale-105 transition-transform flex justify-center">
                    <Building2 size={44} />
                  </div>
                  <CardTitle className="text-white text-base md:text-lg text-center">Company</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">Policy Management & Oversight</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/agent">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-green-500 transition-all cursor-pointer group h-full w-full">
                <CardHeader className="pb-8 pt-8 text-center px-6">
                  <div className="mb-6 text-green-500 group-hover:scale-105 transition-transform flex justify-center">
                    <Users size={44} />
                  </div>
                  <CardTitle className="text-white text-base md:text-lg text-center">Salesman</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">On-field Intelligence & Execution</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/nbfc">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-500 transition-all cursor-pointer group h-full w-full">
                <CardHeader className="pb-8 pt-8 text-center px-6">
                  <div className="mb-6 text-amber-500 group-hover:scale-105 transition-transform flex justify-center">
                    <Landmark size={44} />
                  </div>
                  <CardTitle className="text-white text-base md:text-lg text-center">NBFC / Lender</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">Credit Risk, Collections & Portfolio View</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/horeca">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500 transition-all cursor-pointer group h-full w-full">
                <CardHeader className="pb-8 pt-8 text-center px-6">
                  <div className="mb-6 text-orange-500 group-hover:scale-105 transition-transform flex justify-center">
                    <UtensilsCrossed size={44} />
                  </div>
                  <CardTitle className="text-white text-base md:text-lg text-center">HORECA Buyer</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">Purchase Planning, Fill Rate & Supplier Insights</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/retailer">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-cyan-500 transition-all cursor-pointer group h-full w-full">
                <CardHeader className="pb-8 pt-8 text-center px-6">
                  <div className="mb-6 text-cyan-500 group-hover:scale-105 transition-transform flex justify-center">
                    <Store size={44} />
                  </div>
                  <CardTitle className="text-white text-base md:text-lg text-center">Retailer Dashboard</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm md:text-sm mt-2 text-center">Kirana Operations, Inventory Health & Reorder Signals</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        <div className="pt-20 text-zinc-600 text-xs tracking-wide text-center w-full">
          &copy; 2026 VendorLock AI. All rights reserved.
        </div>
      </div>
    </main>
  );
}
