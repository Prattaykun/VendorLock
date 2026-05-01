"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UtensilsCrossed, 
  TrendingUp, 
  AlertCircle, 
  ShoppingCart, 
  Percent, 
  Zap, 
  ArrowUpRight,
  Package,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid 
} from "recharts";
import { cn } from "@/lib/utils";

export default function HorecaDashboardPage() {
  const categoryData = [
    { category: "Fresh Produce", spend: 45000, color: "#10b981", icon: "🥬" },
    { category: "Proteins", spend: 85000, color: "#f43f5e", icon: "🥩" },
    { category: "Dry Goods", spend: 32000, color: "#f59e0b", icon: "🍚" },
    { category: "Dairy", spend: 54000, color: "#3b82f6", icon: "🥛" },
    { category: "Beverages", spend: 21000, color: "#8b5cf6", icon: "🥤" },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
              Procurement Center
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Live System Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Procurement <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Real-time spend analysis, supplier deviation alerts, and menu-linked demand forecasting for your establishment.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Establishment</p>
            <p className="text-sm font-semibold text-white">Grand Vista Hotel & Spa</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </motion.header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "MTD Spend", value: "₹2,37,000", sub: "+5% vs last month", icon: ShoppingCart, color: "text-blue-400", trend: "up", trendColor: "text-rose-400" },
          { label: "Overcharge Alerts", value: "3 Items", sub: "Above 30-day average", icon: AlertCircle, color: "text-orange-400", trend: "warning", trendColor: "text-orange-400" },
          { label: "Avg Vendor Score", value: "84/100", sub: "High Reliability", icon: Percent, color: "text-emerald-400", trend: "good", trendColor: "text-emerald-400" },
          { label: "Active Vendors", value: "12", sub: "Across 5 categories", icon: Package, color: "text-purple-400" },
        ].map((kpi, i) => (
          <motion.div 
            key={kpi.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#152031]/60 backdrop-blur-md border-white/5 hover:border-white/10 transition-all group relative overflow-hidden h-full">
              <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", kpi.color)}>
                <kpi.icon size={64} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  {kpi.label}
                  <kpi.icon size={14} className={kpi.color} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white mb-1">{kpi.value}</div>
                <div className={cn("text-[10px] font-medium flex items-center gap-1", kpi.trendColor || "text-slate-400")}>
                  {kpi.trend === "up" && <TrendingUp size={10} />}
                  {kpi.trend === "warning" && <AlertCircle size={10} className="text-orange-500" />}
                  {kpi.trend === "good" && <Zap size={10} className="text-emerald-500" />}
                  {kpi.sub}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <motion.div 
          {...fadeUp}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-[#152031]/40 backdrop-blur-xl border-white/5 shadow-2xl h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div>
                <CardTitle className="text-xl text-white font-bold">Category Distribution</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Monthly spend breakdown by procurement category</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700">MTD</div>
                <div className="px-3 py-1 rounded-full hover:bg-slate-800 text-[10px] font-bold text-slate-500 border border-transparent transition-colors cursor-pointer">QTD</div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <defs>
                      {categoryData.map((entry, index) => (
                        <linearGradient key={`grad-${index}`} id={`colorBar-${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickFormatter={(val) => `₹${val/1000}k`} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        border: "1px solid rgba(255,255,255,0.1)", 
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)"
                      }}
                      itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Spend"]}
                    />
                    <Bar dataKey="spend" radius={[0, 6, 6, 0]} barSize={32}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorBar-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
                {categoryData.map((item) => (
                  <div key={item.category} className="p-3 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase truncate">{item.category}</span>
                    </div>
                    <div className="text-sm font-black text-white">₹{(item.spend/1000).toFixed(1)}k</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts & Deviation Section */}
        <div className="space-y-6">
          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-rose-500/5 border-rose-500/20 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Zap className="w-8 h-8 text-rose-500/20 animate-pulse" />
              </div>
              <CardHeader className="pb-3 border-b border-rose-500/10">
                <CardTitle className="text-sm text-rose-400 font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  Price Deviation Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                <div className="divide-y divide-rose-500/10">
                  {[
                    { name: "Premium Paneer (1kg)", vendor: "FreshDairy Co.", current: "₹420", avg: "₹380", change: "+10.5%" },
                    { name: "Tomato (Local)", vendor: "FarmFresh", current: "₹85/kg", avg: "₹60/kg", change: "+41.6%" },
                  ].map((alert, i) => (
                    <div key={i} className="p-4 hover:bg-rose-500/10 transition-all group">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">{alert.name}</h4>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">{alert.vendor}</p>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-rose-500 text-[10px] font-black text-white">
                          {alert.change}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current</span>
                          <span className="text-sm font-mono text-white font-black">{alert.current}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Benchmark</span>
                          <span className="text-xs font-mono text-slate-400 line-through">{alert.avg}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-rose-500/5">
                  <button className="w-full py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2">
                    Review All Alerts <ArrowUpRight size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-[#152031]/40 border-white/5">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm text-white font-bold flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  Supplier Reliability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <div className="divide-y divide-white/5">
                  {[
                    { name: "Prime Proteins", score: 96, status: "A+", fill: "96%" },
                    { name: "FreshDairy Co.", score: 88, status: "A", fill: "92%" },
                    { name: "DryGoods Master", score: 82, status: "B", fill: "85%" },
                  ].map((v, i) => (
                    <div key={i} className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-slate-300">{v.name}</h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                          TIER {v.status}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-bold uppercase">Fill Rate</span>
                          <span className="text-white font-black">{v.fill}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: v.fill }}
                            transition={{ duration: 1, delay: 1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


