import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Users, LayoutDashboard } from "lucide-react";

export default function RootLandingPage() {
  return (
    <main className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none mix-blend-luminosity" 
        style={{ backgroundImage: "url('/distributor-bg.jpeg')" }} 
      />
      <div className="fixed inset-0 z-0 bg-black/70 pointer-events-none" />
      <div className="relative z-10 max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            VendorLock AI
          </h1>
          <p className="text-zinc-400 text-xl">
            Trade Intelligence & Risk Management Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link href="/distributor">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500 transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                  <LayoutDashboard size={48} />
                </div>
                <CardTitle className="text-white">Distributor</CardTitle>
                <CardDescription>Control Tower & Beat Intelligence</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/company">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500 transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="mb-4 text-purple-500 group-hover:scale-110 transition-transform">
                  <Building2 size={48} />
                </div>
                <CardTitle className="text-white">Company</CardTitle>
                <CardDescription>Policy Management & Oversight</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/agent">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-green-500 transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="mb-4 text-green-500 group-hover:scale-110 transition-transform">
                  <Users size={48} />
                </div>
                <CardTitle className="text-white">Salesman</CardTitle>
                <CardDescription>On-field Intelligence & Execution</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="pt-12 text-zinc-500 text-sm">
          &copy; 2026 VendorLock AI. All rights reserved.
        </div>
      </div>
    </main>
  );
}
