"use client";

import { useState } from "react";
import { getTrustScore, getTrustBreakdown, getTrustHistory } from "@/lib/api-client";
import { Search, ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Loader2 } from "lucide-react";
import { formatInr } from "@/lib/helpers";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function MyScorePage() {
  const [retailerId, setRetailerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [scoreData, setScoreData] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerId.trim()) return;
    
    setLoading(true);
    setError("");
    setScoreData(null);
    setBreakdown(null);
    setHistory([]);

    try {
      const id = retailerId.trim();
      const score = await getTrustScore(id);
      
      if (!score || score.flags?.includes("No trust score data")) {
        setError("Retailer not found or no trust score data available.");
        setLoading(false);
        return;
      }

      setScoreData(score);
      
      const [bd, hist] = await Promise.all([
        getTrustBreakdown(id).catch(() => null),
        getTrustHistory(id, 90).catch(() => null)
      ]);

      setBreakdown(bd);
      
      if (hist?.history) {
        setHistory(hist.history.map((h: any) => ({
          date: new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: h.score
        })));
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch trust score data.");
    } finally {
      setLoading(false);
    }
  };

  const TrendIcon = scoreData?.trend === 'UP' ? ArrowUpRight : scoreData?.trend === 'DOWN' ? ArrowDownRight : Minus;
  const trendColor = scoreData?.trend === 'UP' ? 'text-emerald-400' : scoreData?.trend === 'DOWN' ? 'text-rose-400' : 'text-slate-400';

  const factors = [
    { label: "Payment Discipline", key: "payment_discipline", weight: "30%", color: "bg-emerald-500" },
    { label: "Order Consistency", key: "order_consistency", weight: "20%", color: "bg-blue-500" },
    { label: "Cancellation Rate (Inverted)", key: "cancellation_rate", weight: "15%", color: "bg-amber-500" },
    { label: "Return Frequency (Inverted)", key: "return_frequency", weight: "15%", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-2 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Trust Score</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Check your AI-verified credit health and dynamic credit limits across the Distributor network.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-slate-500 w-5 h-5" />
            <input
              type="text"
              value={retailerId}
              onChange={(e) => setRetailerId(e.target.value)}
              placeholder="Enter your Retailer ID (UUID)"
              className="w-full bg-slate-900 border border-slate-700/50 rounded-full py-4 pl-12 pr-32 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !retailerId.trim()}
              className="absolute right-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-medium text-sm transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Score"}
            </button>
          </div>
          {error && <p className="text-rose-400 text-sm mt-3 text-center animate-in fade-in">{error}</p>}
        </form>

        {/* Results Area */}
        {scoreData && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Main Score Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between relative z-10">
                
                {/* Score Circular Display */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-slate-900 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border border-slate-800">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path
                        className={
                          scoreData.score >= 80 ? 'text-emerald-500' : 
                          scoreData.score >= 60 ? 'text-blue-500' : 
                          scoreData.score >= 40 ? 'text-amber-500' : 'text-rose-500'
                        }
                        strokeDasharray={`${scoreData.score}, 100`}
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-4xl font-black text-white">{Math.round(scoreData.score)}</span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Out of 100</p>
                    </div>
                  </div>
                </div>

                {/* Score Details */}
                <div className="flex-1 space-y-5 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">Tier {scoreData.tier} Profile</h2>
                      <Badge variant="outline" className={`
                        ${scoreData.tier === 'A' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : ''}
                        ${scoreData.tier === 'B' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : ''}
                        ${scoreData.tier === 'C' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : ''}
                        ${scoreData.tier === 'D' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : ''}
                      `}>
                        {scoreData.tier === 'A' ? 'Excellent' : scoreData.tier === 'B' ? 'Good' : scoreData.tier === 'C' ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {scoreData.tier === 'A' && "You have exceptional credit health. Eligible for maximum credit limits and auto-approvals."}
                      {scoreData.tier === 'B' && "You have strong credit health. Consistent payments will upgrade you to Tier A."}
                      {scoreData.tier === 'C' && "You have fair credit health. Orders may require manual approval. Improve payments to upgrade."}
                      {scoreData.tier === 'D' && "Your credit privileges are restricted. Please clear outstanding dues immediately."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score Trend</p>
                        <p className="text-sm font-semibold flex items-center justify-center md:justify-start gap-1">
                          <TrendIcon className={`w-4 h-4 ${trendColor}`} /> 
                          <span className={trendColor}>{scoreData.trend}</span>
                        </p>
                     </div>
                     <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Consistency</p>
                        <p className="text-sm font-semibold text-slate-200">
                          {Math.round(scoreData.consistency_index * 100)}%
                        </p>
                     </div>
                  </div>
                </div>

              </div>

              {/* Flags Alert */}
              {scoreData.flags && scoreData.flags.length > 0 && (
                <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3 items-start z-10 relative">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500 mb-1">Action Required</h4>
                    <ul className="text-sm text-amber-500/80 list-disc pl-4 space-y-1">
                      {scoreData.flags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Grid for Breakdown & Chart */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Factor Breakdown */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Score Breakdown</h3>
                <div className="space-y-5">
                  {factors.map(f => {
                    const val = breakdown ? breakdown[f.key] : 0;
                    return (
                      <div key={f.key}>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">{f.label}</span>
                          <span className="text-white font-mono font-medium">{Math.round(val)}/100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                          <div className={`h-full ${f.color} transition-all duration-1000 ease-out`} style={{ width: `${breakdown ? val : 0}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 90-Day Trend
                </h3>
                <div className="flex-1 w-full min-h-[200px]">
                  {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} minTickGap={20} />
                        <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm bg-slate-950/50 rounded-lg border border-slate-800 border-dashed">
                      Historical data loading or unavailable.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
