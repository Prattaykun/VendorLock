import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, ShieldCheck, AlertTriangle, TrendingDown } from "lucide-react";
import TrustDistributionChart from "@/components/dashboard/TrustDistributionChart";

export default function NbfcDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Landmark className="text-amber-400 w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">NBFC Portfolio Dashboard</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Monitor borrower risk, portfolio quality, and collection health using real-time VendorLock trust indices.
          </p>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                Active Loan Book <Landmark className="w-4 h-4 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">₹4.2 Cr</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                +12% vs last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                Avg. Trust Score <ShieldCheck className="w-4 h-4 text-blue-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-400">72 / 100</div>
              <p className="text-xs text-slate-500 mt-1">Tier B Average</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                90+ Days Delinquency <AlertTriangle className="w-4 h-4 text-rose-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-rose-500">1.8%</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> -0.2% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Distribution Chart Component */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Borrower Risk Distribution
          </h2>
          <TrustDistributionChart />
        </section>

        {/* Mock Analytics Panel */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Recent Trust Certificates</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-slate-400 text-sm p-8 text-center border border-dashed border-slate-700 rounded-lg bg-slate-900/50">
              Retailer trust certificates will populate here based on real-time API integrations. 
              <br/>(Coming Soon in v2)
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
