"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getPassThroughMetrics } from "@/lib/api-client";
import { 
  TrendingUp, 
  Info, 
  Calendar, 
  Download, 
  Search, 
  Bell, 
  Settings, 
  Network,
  Bot,
  Shield,
  BarChart3
} from "lucide-react";

const LeakageVarianceMap = dynamic(() => import("./LeakageVarianceMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full rounded-lg border border-slate-800 bg-slate-950/70 animate-pulse" />
  ),
});

interface PassThroughMetrics {
  aggregate_pass_through: {
    percentage: number;
    trend: string;
    trend_period: string;
    total_disbursed: string;
    verified_reach: string;
  };
  regional_leakage: Array<{
    region_id: string;
    region_name: string;
    leakage_percentage: number;
    status: string;
    confidence: number;
    latency_days: number;
    likely_cause: string;
  }>;
  monthly_trends: Array<{
    month: string;
    pass_through: number;
    cost_basis: number;
    is_current?: boolean;
  }>;
  sku_fragility: Array<{
    category: string;
    leakage_percentage: number;
    status: string;
    insight: string;
  }>;
  intelligence_advisory: {
    priority: string;
    summary: string;
    detail: string;
    mitigation_strategy: string;
    confidence: number;
  };
}

export default function PassThroughAnalytics() {
  const [metrics, setMetrics] = useState<PassThroughMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch analytics data
    const fetchMetrics = async () => {
      try {
        const data = await getPassThroughMetrics();
        setMetrics(data);
      } catch (error) {
        // Silently fail and use mock data
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">Failed to load analytics data</p>
      </div>
    );
  }

  const topLeakageRegion = [...metrics.regional_leakage].sort(
    (left, right) => right.leakage_percentage - left.leakage_percentage,
  )[0];

  const lowestLeakageRegion = [...metrics.regional_leakage].sort(
    (left, right) => left.leakage_percentage - right.leakage_percentage,
  )[0];

  const maxCostBasis = Math.max(...metrics.monthly_trends.map((trend) => trend.cost_basis), 1);
  const trendChartWidth = 720;
  const trendChartHeight = 280;
  const trendBaselineY = 230;
  const costScaleHeight = 170;
  const passThroughScaleHeight = 170;
  const trendPoints = metrics.monthly_trends.map((trend, index) => {
    const x = 90 + index * 210;
    const costHeight = (trend.cost_basis / maxCostBasis) * costScaleHeight;
    const passThroughY = trendBaselineY - (trend.pass_through / 100) * passThroughScaleHeight;

    return {
      ...trend,
      x,
      costHeight,
      passThroughY,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPTIMAL":
      case "ACCEPTABLE":
        return "text-emerald-400";
      case "MODERATE":
        return "text-orange-400";
      case "HIGH_RISK":
      case "HIGH_LEAK":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "OPTIMAL":
      case "ACCEPTABLE":
        return "bg-emerald-500";
      case "MODERATE":
        return "bg-orange-500";
      case "HIGH_RISK":
      case "HIGH_LEAK":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb]">
      {/* Top AppBar */}
      <header className="fixed top-0 right-0 z-50 flex items-center justify-between px-6 h-16 w-[calc(100%-280px)] ml-auto bg-slate-900/60 backdrop-blur-xl border-b border-slate-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="bg-slate-800/50 border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 text-slate-300"
              placeholder="Search analytics data..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Live Sentinel Active
            </span>
          </div>
          <div className="flex gap-4">
            <button className="text-slate-400 hover:text-blue-400 transition-colors">
              <Bell size={20} />
            </button>
            <button className="text-slate-400 hover:text-blue-400 transition-colors">
              <Settings size={20} />
            </button>
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen relative">
        <div className="relative z-10 p-8 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#d8e3fb] mb-2">
                Scheme Pass-Through Analytics
              </h2>
              <p className="text-base text-slate-400 max-w-2xl">
                High-altitude oversight of benefit distribution across the regional retail network. 
                All data is anonymized and aggregated at SKU and regional levels.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-[#1f2a3c] px-4 py-2 rounded-lg border border-[#424754] flex items-center gap-2">
                <Calendar className="text-blue-500" size={16} />
                <span className="text-xs font-mono text-[#d8e3fb]">
                  Oct 01 - Oct 31, 2023
                </span>
              </div>
              <Button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Download size={16} />
                Export Report
              </Button>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Main KPI: Pass-Through Gauge */}
            <Card className="col-span-12 lg:col-span-4 bg-[#152031]/70 backdrop-blur-sm border border-white/10 rounded-xl min-h-[420px]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-semibold">Aggregate Pass-Through</CardTitle>
                  <Info className="text-blue-400" size={20} />
                </div>
                <p className="text-sm text-slate-400">
                  Overall efficiency of direct-to-retailer benefits reaching intended points.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4 relative">
                  {/* Custom SVG Gauge */}
                  <svg className="w-56 h-56 transform -rotate-90">
                    <circle
                      className="text-slate-800"
                      cx="112"
                      cy="112"
                      fill="transparent"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="12"
                    />
                    <circle
                      className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      cx="112"
                      cy="112"
                      fill="transparent"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray="628.3"
                      strokeDashoffset={628.3 * (1 - metrics.aggregate_pass_through.percentage / 100)}
                      style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
                    <span className="text-5xl font-black text-[#d8e3fb] tracking-tighter">
                      {metrics.aggregate_pass_through.percentage}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                      <TrendingUp size={12} />
                      {metrics.aggregate_pass_through.trend} {metrics.aggregate_pass_through.trend_period}
                    </span>
                  </div>
                </div>
                <div className="mt-8 border-t border-slate-700/50 pt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Total Disbursed
                    </p>
                    <p className="font-mono text-lg text-[#d8e3fb]">
                      {metrics.aggregate_pass_through.total_disbursed}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Verified Reach
                    </p>
                    <p className="font-mono text-lg text-[#d8e3fb]">
                      {metrics.aggregate_pass_through.verified_reach}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leakage by Region */}
            <Card className="col-span-12 lg:col-span-8 bg-[#152031]/70 backdrop-blur-sm border border-white/10 rounded-xl min-h-[420px]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-semibold">Leakage Variance by Region</CardTitle>
                    <p className="text-sm text-slate-400">
                      Anonymized regional map showing where scheme benefits are failing to land.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {metrics.regional_leakage.map((region) => (
                      <Badge
                        key={region.region_id}
                        className={
                          region.status === "CRITICAL"
                            ? "bg-red-500/10 text-red-300 text-[10px] font-bold rounded-full border border-red-500/20"
                            : "bg-amber-500/10 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/20"
                        }
                      >
                        {region.region_name.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
                  <LeakageVarianceMap regions={metrics.regional_leakage} />

                  <div className="space-y-4">
                    {metrics.regional_leakage.map((region) => (
                      <div key={region.region_id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#d8e3fb]">{region.region_name}</p>
                            <p className="text-xs text-slate-500 mt-1">{region.likely_cause}</p>
                          </div>
                          <Badge
                            className={
                              region.status === "CRITICAL"
                                ? "bg-red-500/10 text-red-300 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }
                          >
                            {region.leakage_percentage}%
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          <Progress value={region.leakage_percentage} className="h-2 bg-slate-800" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Confidence {region.confidence}%</span>
                            <span>Latency {region.latency_days} days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  <div className="border-l-2 border-blue-500 pl-4">
                    <p className="text-xs text-slate-500 font-medium">Lowest Leakage</p>
                    <p className="text-sm font-bold">{lowestLeakageRegion.region_name}</p>
                  </div>
                  <div className="border-l-2 border-red-500 pl-4">
                    <p className="text-xs text-slate-500 font-medium">Highest Risk</p>
                    <p className="text-sm font-bold">{topLeakageRegion.region_name}</p>
                  </div>
                  <div className="border-l-2 border-slate-700 pl-4">
                    <p className="text-xs text-slate-500 font-medium">Avg. Latency</p>
                    <p className="text-sm font-bold">
                      {(
                        metrics.regional_leakage.reduce((total, region) => total + region.latency_days, 0) /
                        metrics.regional_leakage.length
                      ).toFixed(1)} Days
                    </p>
                  </div>
                  <div className="border-l-2 border-slate-700 pl-4">
                    <p className="text-xs text-slate-500 font-medium">Sentinel Confidence</p>
                    <p className="text-sm font-bold">
                      {(
                        metrics.regional_leakage.reduce((total, region) => total + region.confidence, 0) /
                        metrics.regional_leakage.length
                      ).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Month-on-Month Pass-Through Comparison */}
            <Card className="col-span-12 lg:col-span-7 bg-[#152031]/70 backdrop-blur-sm border border-white/10 rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-semibold">Trend Velocity</CardTitle>
                    <p className="text-sm text-slate-400">
                      Monthly pass-through percentage vs distribution cost.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                      <span className="text-[10px] font-bold text-slate-400">PASS-THROUGH %</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-slate-700"></div>
                      <span className="text-[10px] font-bold text-slate-400">COST BASIS</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/50 p-4 overflow-hidden">
                  <svg viewBox={`0 0 ${trendChartWidth} ${trendChartHeight}`} className="w-full h-72 overflow-visible">
                    <defs>
                      <linearGradient id="trendCostGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#475569" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#1f2937" stopOpacity="0.6" />
                      </linearGradient>
                      <linearGradient id="trendPassGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.75" />
                      </linearGradient>
                    </defs>

                    {[0, 1, 2, 3].map((tick) => {
                      const y = 40 + tick * 55;
                      return (
                        <g key={tick}>
                          <line x1="40" y1={y} x2="680" y2={y} stroke="#334155" strokeDasharray="4 8" strokeOpacity="0.7" />
                          <text x="10" y={y + 4} fill="#64748b" fontSize="10" fontWeight="700">
                            {100 - tick * 25}%
                          </text>
                        </g>
                      );
                    })}

                    <line x1="40" y1={trendBaselineY} x2="680" y2={trendBaselineY} stroke="#475569" strokeWidth="1.25" />

                    {trendPoints.map((trend) => (
                      <g key={trend.month}>
                        <rect
                          x={trend.x - 64}
                          y={trendBaselineY - trend.costHeight}
                          width="44"
                          height={trend.costHeight}
                          rx="10"
                          fill="url(#trendCostGradient)"
                        />
                        <rect
                          x={trend.x - 10}
                          y={trendBaselineY - (trend.pass_through / 100) * 170}
                          width="44"
                          height={(trend.pass_through / 100) * 170}
                          rx="10"
                          fill={trend.is_current ? "url(#trendPassGradient)" : "rgba(96, 165, 250, 0.45)"}
                          stroke={trend.is_current ? "#93c5fd" : "transparent"}
                        />
                        {trend.is_current && (
                          <g>
                            <circle cx={trend.x + 12} cy={trend.passThroughY} r="6" fill="#60a5fa" stroke="#dbeafe" strokeWidth="2" />
                            <text
                              x={trend.x + 12}
                              y={trend.passThroughY - 14}
                              textAnchor="middle"
                              fill="#bfdbfe"
                              fontSize="10"
                              fontWeight="700"
                            >
                              CUR
                            </text>
                          </g>
                        )}
                        {!trend.is_current && (
                          <circle cx={trend.x + 12} cy={trend.passThroughY} r="4" fill="#93c5fd" />
                        )}
                        <text x={trend.x - 42} y="260" fill={trend.is_current ? "#93c5fd" : "#64748b"} fontSize="10" fontWeight="700">
                          {trend.month}
                        </text>
                        <text x={trend.x - 42} y={trendBaselineY - trend.costHeight - 8} fill="#94a3b8" fontSize="10" fontWeight="700">
                          ₹{(trend.cost_basis / 100000).toFixed(1)}L
                        </text>
                        <text x={trend.x + 34} y={trendBaselineY - (trend.pass_through / 100) * 170 - 8} fill="#bfdbfe" fontSize="10" fontWeight="700">
                          {trend.pass_through}%
                        </text>
                      </g>
                    ))}

                    <polyline
                      points={trendPoints.map((trend) => `${trend.x + 12},${trend.passThroughY}`).join(" ")}
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* SKU Leakage Breakdown */}
            <Card className="col-span-12 lg:col-span-5 bg-[#152031]/70 backdrop-blur-sm border border-white/10 rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-semibold">SKU Fragility</CardTitle>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Aggregated
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {metrics.sku_fragility.map((sku) => (
                    <div key={sku.category} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-[#d8e3fb]">
                          {sku.category}
                        </span>
                        <span className={`text-sm font-mono ${getStatusColor(sku.status)}`}>
                          {sku.leakage_percentage}% Leak
                        </span>
                      </div>
                      <Progress
                        value={sku.leakage_percentage}
                        className="h-1.5 bg-slate-800"
                        indicatorClassName={getStatusBgColor(sku.status)}
                      />
                      <p className="text-[10px] text-slate-500 mt-2">{sku.insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Intelligence Advisory Section */}
          <Card className="mt-6 bg-[#152031]/70 backdrop-blur-sm border border-white/10 rounded-xl border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                <Network className="text-blue-400 animate-pulse" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
                  Sentinel AI Advisory
                </p>
                <p className="text-sm text-slate-300">
                  "{metrics.intelligence_advisory.summary} {metrics.intelligence_advisory.detail}"
                </p>
              </div>
              <Button className="ml-auto text-blue-500 text-sm font-bold hover:underline bg-transparent hover:bg-transparent p-0">
                View Mitigation Strategy
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <Bot size={24} />
      </button>
    </div>
  );
}