import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

export default function RetailerDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Retailer (Kirana / Small Shop) Dashboard</h1>
          <p className="text-slate-400">Follow store-level sales rhythm, working capital pressure, and smart replenishment cues.</p>
        </header>

        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="flex flex-row items-center gap-3">
            <Store className="text-cyan-400" size={24} />
            <CardTitle>Dashboard Scaffold Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              This route is live and ready for panel integration (cash-cycle metrics, top movers, and reorder recommendations).
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
