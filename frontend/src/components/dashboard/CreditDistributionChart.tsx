import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatInr } from "@/lib/helpers";

export default function CreditDistributionChart({ retailers = [] }: { retailers: any[] }) {
  const data = useMemo(() => {
    // Aggregate outstanding vs available credit by tier
    const aggregated = {
      A: { tier: "A", outstanding: 0, available: 0, count: 0 },
      B: { tier: "B", outstanding: 0, available: 0, count: 0 },
      C: { tier: "C", outstanding: 0, available: 0, count: 0 },
      D: { tier: "D", outstanding: 0, available: 0, count: 0 },
    };

    retailers.forEach(r => {
      const tier = r.tier || "C";
      if (aggregated[tier as keyof typeof aggregated]) {
        const out = Number(r.outstanding || r.outstanding_balance || 0);
        const limit = Number(r.creditLimit || r.credit_limit || 0);
        aggregated[tier as keyof typeof aggregated].outstanding += out;
        aggregated[tier as keyof typeof aggregated].available += Math.max(0, limit - out);
        aggregated[tier as keyof typeof aggregated].count += 1;
      }
    });

    return [
      { name: "Tier A (Low Risk)", value: aggregated.A.outstanding, color: "#10b981", fullObj: aggregated.A },
      { name: "Tier B (Medium Risk)", value: aggregated.B.outstanding, color: "#3b82f6", fullObj: aggregated.B },
      { name: "Tier C (High Risk)", value: aggregated.C.outstanding, color: "#f59e0b", fullObj: aggregated.C },
      { name: "Tier D (Critical)", value: aggregated.D.outstanding, color: "#ef4444", fullObj: aggregated.D },
    ].filter(d => d.value > 0);
  }, [retailers]);

  const totalExposure = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-semibold text-white mb-2">{data.name}</p>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Total Outstanding:</span>
              <span className="font-mono font-medium text-white">{formatInr(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Retailers:</span>
              <span className="font-mono font-medium text-white">{data.fullObj.count}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full shadow-lg">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Credit Exposure by Risk Tier</h3>
        <p className="text-xs text-slate-500 mt-1">Total network exposure: <span className="font-mono text-slate-300 font-medium">{formatInr(totalExposure)}</span></p>
      </div>

      <div className="flex-1 min-h-[200px] w-full relative">
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Exposure</p>
                <p className="text-sm font-bold text-white font-mono">{formatInr(totalExposure)}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            No credit exposure data available.
          </div>
        )}
      </div>
    </div>
  );
}
