"use client";

import { useState, useEffect } from "react";
import { MapPin, Package } from "lucide-react";
import { formatInr } from "@/lib/helpers";

const INTENSITY_COLORS = [
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
];

export default function RevenueHeatmapPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    import("@/lib/api-client").then(({ getRevenueHeatmap }) => {
      getRevenueHeatmap(periodDays).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    });
  }, [periodDays]);

  const heatmap = data?.heatmap || [];
  const maxRevenue = heatmap.length > 0 ? Math.max(...heatmap.map((h: any) => h.revenue)) : 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" /> Revenue by Channel
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Total: {data?.total_revenue != null ? `₹${formatInr(data.total_revenue)}` : "—"} · {data?.order_count || 0} orders
          </p>
        </div>
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-md border border-slate-700/50">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setPeriodDays(d)} className={`text-xs px-2.5 py-1 rounded transition-colors ${periodDays === d ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>{d}D</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="space-y-3 animate-pulse">{[0, 1, 2].map(i => <div key={i} className="h-14 bg-slate-800 rounded-lg" />)}</div>
      ) : heatmap.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm border border-slate-800 border-dashed rounded-xl">
          <Package className="w-8 h-8 mx-auto mb-2 text-slate-700" />No revenue data for this period
        </div>
      ) : (
        <div className="space-y-3">
          {heatmap.map((row: any, i: number) => {
            const colorClass = INTENSITY_COLORS[Math.min(i, INTENSITY_COLORS.length - 1)];
            const barWidth = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={row.channel} className={`rounded-lg border p-3 ${colorClass}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium capitalize">{row.channel}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm">₹{formatInr(row.revenue)}</span>
                    <span className="text-xs ml-2 opacity-70">{row.revenue_share_pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-current rounded-full transition-all duration-700" style={{ width: `${barWidth}%` }} />
                </div>
                <div className="flex gap-3 mt-2 text-[10px] opacity-70">
                  <span>{row.order_count} orders</span>
                  {Object.entries(row.status_breakdown || {}).slice(0, 3).map(([status, count]) => (
                    <span key={status}>{status}: {count as number}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
