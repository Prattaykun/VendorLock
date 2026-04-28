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
    <main className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none mix-blend-luminosity" 
        style={{ backgroundImage: "url('/distributor-bg.jpeg')" }} 
      />
      <div className="fixed inset-0 z-0 bg-black/70 pointer-events-none" />
      <div className="relative z-10 max-w-5xl w-full space-y-12 text-center">
        <div className="space-y-4 pb-8">
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            VendorLock AI
          </h1>
          <p className="text-zinc-400 text-lg">
            Trade Intelligence & Risk Management Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/distributor">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500 transition-all cursor-pointer group h-full">
              <CardHeader className="pb-6">
                <div className="mb-6 text-blue-500 group-hover:scale-110 transition-transform flex justify-center">
                  <LayoutDashboard size={56} />
                </div>
                <CardTitle className="text-white text-lg">Distributor</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-2">Control Tower & Beat Intelligence</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/company">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500 transition-all cursor-pointer group h-full">
              <CardHeader className="pb-6">
                <div className="mb-6 text-purple-500 group-hover:scale-110 transition-transform flex justify-center">
                  <Building2 size={56} />
                </div>
                <CardTitle className="text-white text-lg">Company</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-2">Policy Management & Oversight</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/agent">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-green-500 transition-all cursor-pointer group h-full">
              <CardHeader className="pb-6">
                <div className="mb-6 text-green-500 group-hover:scale-110 transition-transform flex justify-center">
                  <Users size={56} />
                </div>
                <CardTitle className="text-white text-lg">Salesman</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-2">On-field Intelligence & Execution</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/nbfc">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-500 transition-all cursor-pointer group h-full">
              <CardHeader className="pb-6">
                <div className="mb-6 text-amber-500 group-hover:scale-110 transition-transform flex justify-center">
                  <Landmark size={56} />
                </div>
                <CardTitle className="text-white text-lg">NBFC / Lender</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-2">Credit Risk, Collections & Portfolio View</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/horeca">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500 transition-all cursor-pointer group h-full">
              <CardHeader className="pb-6">
                <div className="mb-6 text-orange-500 group-hover:scale-110 transition-transform flex justify-center">
                  <UtensilsCrossed size={56} />
                </div>
                <CardTitle className="text-white text-lg">HORECA Buyer</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-2">Purchase Planning, Fill Rate & Supplier Insights</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/retailer">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-cyan-500 transition-all cursor-pointer group h-full">
              <CardHeader className="pb-6">
                <div className="mb-6 text-cyan-500 group-hover:scale-110 transition-transform flex justify-center">
                  <Store size={56} />
                </div>
                <CardTitle className="text-white text-lg">Retailer Dashboard</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-2">Kirana Operations, Inventory Health & Reorder Signals</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="pt-16 text-zinc-600 text-xs tracking-wide">
          &copy; 2026 VendorLock AI. All rights reserved.
        </div>
      </div>
    </main>
  );
}
