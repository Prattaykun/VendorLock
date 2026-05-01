import { useState, useEffect } from "react";
import { Loader2, ArrowUpRight, ArrowDownRight, Minus, RefreshCw } from "lucide-react";
import { getTrustScore, recalculateScore } from "@/lib/api-client";
import TrustScoreModal from "./TrustScoreModal";

export default function TrustScoreCard({ retailerId }: { retailerId: string }) {
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchScore();
  }, [retailerId]);

  const fetchScore = () => {
    setLoading(true);
    getTrustScore(retailerId)
      .then(setScoreData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleRecalculate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecalculating(true);
    try {
      await recalculateScore(retailerId);
      await fetchScore();
    } catch (e) {
      console.error(e);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return <div className="h-10 w-24 bg-slate-800/50 rounded-lg animate-pulse"></div>;
  }

  if (!scoreData) {
    return <div className="text-xs text-slate-500">No score</div>;
  }

  const { score, tier, trend } = scoreData;

  const tierColor = 
    tier === 'A' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    tier === 'B' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
    tier === 'C' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
    'text-rose-400 bg-rose-500/10 border-rose-500/20';

  const TrendIcon = trend === 'UP' ? ArrowUpRight : trend === 'DOWN' ? ArrowDownRight : Minus;
  const trendColor = trend === 'UP' ? 'text-emerald-400' : trend === 'DOWN' ? 'text-rose-400' : 'text-slate-400';

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50 group"
      >
        <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 shadow-inner">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={
                score >= 80 ? 'text-emerald-500' : 
                score >= 60 ? 'text-blue-500' : 
                score >= 40 ? 'text-amber-500' : 'text-rose-500'
              }
              strokeDasharray={`${score}, 100`}
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="text-xs font-bold text-white relative z-10">{Math.round(score)}</span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tierColor}`}>
              Tier {tier}
            </span>
            <TrendIcon className={`w-3 h-3 ${trendColor}`} />
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wide flex items-center justify-between">
            Trust Score
            <button 
              onClick={handleRecalculate} 
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
              title="Recalculate Score"
            >
              <RefreshCw className={`w-3 h-3 ${recalculating ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TrustScoreModal 
          retailerId={retailerId} 
          initialScore={scoreData} 
          onClose={() => setIsModalOpen(false)}
          onRecalculate={fetchScore}
        />
      )}
    </>
  );
}
