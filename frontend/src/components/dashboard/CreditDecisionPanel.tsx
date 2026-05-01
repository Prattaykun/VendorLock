import { useState, useMemo } from "react";
import { formatInr } from "@/lib/helpers";
import { ShieldCheck, AlertTriangle, ArrowRight, ShieldAlert, BadgeInfo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmOrder, blockAndNudgeOrder } from "@/lib/api-client";
import { toast } from "sonner";

export default function CreditDecisionPanel({ onAction, orders, alerts, retailers, updateOrderStatus }: any) {
  const [loading, setLoading] = useState<string | null>(null);
  
  const pendingOrders = useMemo(() => {
    return (orders || []).filter((o: any) => o.status === "PENDING_CONFIRMATION" || o.status === "BLOCKED");
  }, [orders]);

  const handleApprove = async (orderId: string) => {
    setLoading(orderId);
    try {
      await confirmOrder(orderId);
      updateOrderStatus && updateOrderStatus(orderId, "CONFIRMED");
      toast.success(`Order ${orderId.split('-')[0]} Approved`);
      onAction(`Approved order ${orderId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to approve order");
    } finally {
      setLoading(null);
    }
  };

  const handleBlockNudge = async (orderId: string, retailerName: string) => {
    setLoading(orderId);
    try {
      await blockAndNudgeOrder(orderId, `Hello ${retailerName}, your recent order has been blocked due to credit limit or payment issues. Please clear outstanding dues.`);
      updateOrderStatus && updateOrderStatus(orderId, "BLOCKED");
      toast.success(`Order ${orderId.split('-')[0]} Blocked and Nudge Sent`);
      onAction(`Blocked and Nudged order ${orderId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to block order");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 bg-[#0f172a] min-h-full w-full max-w-[1200px] mx-auto text-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-400" /> AI Credit Decision Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">Review orders held by Agent 1 due to credit limit breaches or low trust scores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Pending Decisions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            Pending Decisions <span className="text-xs bg-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-full">{pendingOrders.length}</span>
          </h3>
          
          {pendingOrders.length === 0 ? (
            <div className="border border-slate-800 rounded-lg p-8 text-center text-slate-500 bg-slate-900/50">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <p>No pending credit decisions.</p>
              <p className="text-xs mt-1 text-slate-600">All orders are automatically cleared by the agent.</p>
            </div>
          ) : (
            pendingOrders.map((o: any) => {
              const r = retailers?.find((r: any) => r.id === o.retailer_id) || {};
              const tScore = r.trustScore || 50;
              return (
                <div key={o.id} className="border border-slate-800 rounded-xl bg-slate-900/80 p-5 shadow-lg overflow-hidden relative">
                  {o.status === "BLOCKED" && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
                  {o.status === "PENDING_CONFIRMATION" && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-white text-lg">{o.retailers?.name || o.retailerName || "Unknown Retailer"}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{o.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold font-mono text-white">{formatInr(o.total_amount || o.orderValue)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase mt-1 inline-block
                        ${o.status === 'BLOCKED' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}
                      `}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* AI Context Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Trust Score</p>
                      <p className={`font-mono font-bold text-lg ${tScore >= 80 ? 'text-emerald-400' : tScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{tScore}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Outstanding</p>
                      <p className="font-mono font-bold text-slate-300 text-sm">{formatInr(r.outstanding || 0)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Credit Limit</p>
                      <p className="font-mono font-bold text-slate-300 text-sm">{formatInr(r.creditLimit || 50000)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Tier</p>
                      <p className="font-mono font-bold text-slate-300 text-sm">{r.tier || "C"}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-5 flex gap-3 text-sm">
                    <BadgeInfo className="w-5 h-5 text-indigo-400 shrink-0" />
                    <p className="text-indigo-200">
                      <strong>Agent Insight:</strong> Order value ({formatInr(o.total_amount || o.orderValue)}) combined with outstanding balance exceeds retailer's active credit limit.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end items-center border-t border-slate-800 pt-4">
                    <Button 
                      variant="outline" 
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                      onClick={() => handleBlockNudge(o.id, o.retailers?.name || o.retailerName)}
                      disabled={loading === o.id || o.status === "BLOCKED"}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Block & Send Telegram Nudge
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => handleApprove(o.id)}
                      disabled={loading === o.id}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> Override & Approve
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: System Context */}
        <div className="space-y-6">
          <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest text-slate-400">Risk Policy Engine</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="text-slate-300">Tier A & B automatically approved up to 120% of limit.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="text-slate-300">Tier C requires manual override for any limit breach.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span className="text-slate-300">Tier D blocked by default for credit orders.</span>
              </li>
            </ul>
          </div>
          
          <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest text-slate-400">Recent Alerts</h3>
            <div className="space-y-4">
              {(alerts || []).slice(0, 4).map((a: any) => (
                <div key={a.id} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className={`font-medium ${a.type === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>{a.title}</span>
                    <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400 text-xs truncate">{a.message}</p>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && <p className="text-xs text-slate-500">No active risk alerts.</p>}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
              View All Alerts <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
