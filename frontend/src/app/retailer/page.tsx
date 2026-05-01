"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShieldCheck, Wallet, ShoppingBag, ArrowRightLeft, Gift, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RetailerDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-md md:max-w-4xl mx-auto space-y-6">
        
        {/* Mobile-Friendly Header */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Gupta Provisions</h1>
            <p className="text-slate-400 text-xs mt-1">ID: RET-9021 • Route: South Zone</p>
          </div>
          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
            <Store className="w-5 h-5 text-indigo-400" />
          </div>
        </header>

        {/* Hero KPI: Trust Score & Credit */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800 shadow-lg shadow-black/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Trust Score
              </div>
              <div>
                <div className="text-3xl font-black text-white">82<span className="text-sm text-slate-500 font-normal">/100</span></div>
                <div className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-wider">Tier A</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-lg shadow-black/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Wallet className="w-4 h-4 text-emerald-400" /> Outstanding
              </div>
              <div>
                <div className="text-2xl font-black text-rose-400">₹14,500</div>
                <div className="text-[10px] text-slate-500 mt-1">Limit: ₹50,000</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (Mobile Grid) */}
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline" className="h-20 flex flex-col gap-2 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-blue-500/50">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            <span className="text-[10px] font-medium">Order</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-medium">Pay</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-amber-500/50">
            <ArrowRightLeft className="w-6 h-6 text-amber-400" />
            <span className="text-[10px] font-medium">Return</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-purple-500/50">
            <FileText className="w-6 h-6 text-purple-400" />
            <span className="text-[10px] font-medium">Cert</span>
          </Button>
        </div>

        {/* Active Schemes */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg shadow-black/20">
          <CardHeader className="p-4 pb-2 border-b border-slate-800/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
              <Gift className="w-4 h-4 text-rose-400" /> Active Schemes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/50">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Diwali Mega Stock</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Buy 10 boxes, get 1 free</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">8/10</span>
                  <p className="text-[9px] text-slate-500">2 more for reward</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg shadow-black/20">
          <CardHeader className="p-4 pb-2 border-b border-slate-800/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-blue-400">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/50">
              {[
                { id: "ORD-992", date: "Today", amount: 4500, status: "Delivering" },
                { id: "ORD-988", date: "2 days ago", amount: 12400, status: "Delivered" },
                { id: "ORD-980", date: "Last week", amount: 8900, status: "Delivered" },
              ].map((ord) => (
                <div key={ord.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{ord.id}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ord.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-xs font-mono text-white">₹{ord.amount}</div>
                      <div className={`text-[9px] font-bold ${ord.status === "Delivering" ? "text-amber-400" : "text-emerald-400"}`}>
                        {ord.status}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
