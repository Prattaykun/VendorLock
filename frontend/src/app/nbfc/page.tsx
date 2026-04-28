import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function NbfcDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3 pb-6 border-b border-slate-800">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">NBFC / Lender Dashboard</h1>
          <p className="text-slate-300 text-lg">Monitor borrower risk, portfolio quality, and collection health in one place.</p>
        </header>

        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-4">
              <Landmark className="text-amber-400" size={28} />
              <CardTitle className="text-lg">Dashboard Scaffold Ready</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-slate-300 text-sm leading-relaxed">
              This route is live and ready for panel integration (loan book KPIs, delinquency buckets, and underwriting actions).
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
