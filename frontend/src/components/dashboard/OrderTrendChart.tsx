import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatInr } from "@/lib/helpers";

export default function OrderTrendChart({ orders = [] }: { orders: any[] }) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");

  const data = useMemo(() => {
    // Process orders into daily aggregated amounts
    const aggregated: Record<string, number> = {};
    const now = new Date();
    
    let daysToSubtract = 30;
    if (timeRange === "7D") daysToSubtract = 7;
    if (timeRange === "90D") daysToSubtract = 90;

    // Initialize all days to 0
    for (let i = daysToSubtract - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      aggregated[dateStr] = 0;
    }

    // Add order amounts
    orders.forEach(order => {
      const d = new Date(order.created_at || order.createdAt);
      if (d >= new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000)) {
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (aggregated[dateStr] !== undefined) {
          aggregated[dateStr] += Number(order.total_amount || order.orderValue || 0);
        }
      }
    });

    return Object.keys(aggregated).map(date => ({
      date,
      value: aggregated[date]
    }));
  }, [orders, timeRange]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Order Volume Trend</h3>
          <p className="text-xs text-slate-500 mt-1">Aggregated daily order value over time</p>
        </div>
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-md border border-slate-700/50">
          {(["7D", "30D", "90D"] as const).map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${timeRange === tr ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[200px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={10} 
                tickMargin={10} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={20} 
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                tickLine={false} 
                axisLine={false} 
                width={50}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(value: any) => [formatInr(value), "Volume"]}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            Not enough data available.
          </div>
        )}
      </div>
    </div>
  );
}
