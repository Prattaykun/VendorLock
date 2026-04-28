import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";

export default function HorecaDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">HORECA (Hotel, Restaurant, Cafe) Buyer Dashboard</h1>
          <p className="text-slate-400">Track procurement velocity, supplier performance, and stock-out risk for food service operations.</p>
        </header>

        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="flex flex-row items-center gap-3">
            <UtensilsCrossed className="text-orange-400" size={24} />
            <CardTitle>Dashboard Scaffold Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              This route is live and ready for panel integration (SKU burn-rate, delivery adherence, and reorder intelligence).
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
