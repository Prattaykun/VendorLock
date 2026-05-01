import { useState, useEffect } from "react";
import { X, RefreshCw, AlertCircle, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { getTrustBreakdown, getTrustHistory, recalculateScore } from "@/lib/api-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TrustScoreModal({ retailerId, initialScore, onClose, onRecalculate }: any) {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    Promise.all([
      getTrustBreakdown(retailerId),
      getTrustHistory(retailerId, 90)
    ]).then(([bd, hist]) => {
      setBreakdown(bd);
      if (hist?.history) {
        setHistory(hist.history.map((h: any) => ({
          date: new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: h.score
        })));
      }
    }).finally(() => setLoading(false));
  }, [retailerId]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    await recalculateScore(retailerId);
    await onRecalculate();
    // Refresh modal data
    const [bd, hist] = await Promise.all([
      getTrustBreakdown(retailerId),
      getTrustHistory(retailerId, 90)
    ]);
    setBreakdown(bd);
    if (hist?.history) {
      setHistory(hist.history.map((h: any) => ({
        date: new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: h.score
      })));
    }
    setRecalculating(false);
  };

  const factors = [
    { label: "Payment Discipline", key: "payment_discipline", weight: "30%", color: "bg-emerald-500" },
    { label: "Order Consistency", key: "order_consistency", weight: "20%", color: "bg-blue-500" },
    { label: "Cancellation Rate (Inverted)", key: "cancellation_rate", weight: "15%", color: "bg-amber-500" },
    { label: "Return Frequency (Inverted)", key: "return_frequency", weight: "15%", color: "bg-orange-500" },
    { label: "Communication Reliability", key: "communication_reliability", weight: "10%", color: "bg-purple-500" },
    { label: "Trade Stability", key: "trade_stability", weight: "10%", color: "bg-indigo-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-inner text-xl font-black text-white">
              {Math.round(initialScore.score)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Trust Score Profile
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">Tier {initialScore.tier}</span>
              </h3>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI-Verified behaviour matrix
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Flags Alert */}
          {initialScore.flags && initialScore.flags.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-1">Active Risk Flags</h4>
                <ul className="text-sm text-amber-500/80 list-disc pl-4 space-y-1">
                  {initialScore.flags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Breakdown Bars */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Sub-Score Breakdown</h4>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
            </div>
            
            <div className="space-y-4">
              {factors.map(f => {
                const val = breakdown ? breakdown[f.key] : 0;
                return (
                  <div key={f.key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{f.label} <span className="text-slate-600">({f.weight})</span></span>
                      <span className="text-white font-mono">{Math.round(val)}/100</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${f.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${loading ? 0 : val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 90 Day Trend Chart */}
          <div>
             <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 90-Day Trend
            </h4>
            <div className="h-48 w-full bg-slate-900/50 rounded-lg border border-slate-800 p-4">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} minTickGap={20} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  Not enough historical data available.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button 
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            Force Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
