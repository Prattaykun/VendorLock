"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, TrendingUp } from "lucide-react";

const TIER_COLORS = { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#ef4444" };

export default function TrustDistributionChart() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/api-client").then(({ getTrustDistributionAnalytics }) => {
      getTrustDistributionAnalytics().then(d => {
        setData(d);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  const tierData = data ? Object.entries(data.tier_distribution || {}).map(([tier, count]) => ({
    tier, count, color: TIER_COLORS[tier as keyof typeof TIER_COLORS] || "#94a3b8"
  })).filter(d => (d.count as number) > 0) : [];

  const histogramData = data?.score_histogram || [];

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[0, 1].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[300px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Score Histogram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Score Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-1">Count of retailers per score band</p>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} barSize={30}>
              <XAxis dataKey="range" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
                formatter={(val: any) => [val, "Retailers"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {histogramData.map((entry: any, i: number) => {
                  const range = entry.range || "";
                  const color = range.startsWith("81") ? "#10b981"
                    : range.startsWith("61") ? "#3b82f6"
                    : range.startsWith("41") ? "#f59e0b"
                    : "#ef4444";
                  return <Cell key={i} fill={color} fillOpacity={0.85} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier Pie */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Tier Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {data?.total_retailers || 0} total retailers across {tierData.length} tiers
          </p>
        </div>
        <div className="flex-1 relative min-h-[220px]">
          {tierData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierData} dataKey="count" nameKey="tier" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="none">
                  {tierData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-400">Tier {value}</span>}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  formatter={(val: any, name: any) => [val + " retailers", `Tier ${name}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">No trust data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
