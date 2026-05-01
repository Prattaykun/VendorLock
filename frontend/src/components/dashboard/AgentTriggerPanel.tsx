"use client";

import { useState } from "react";
import { Terminal, Play, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const AGENTS = [
  { id: "agent_1_trade_capture",        label: "Agent 1 — Trade Capture",         desc: "Parse Telegram messages into structured orders" },
  { id: "agent_2_trust_scoring",        label: "Agent 2 — Trust Scoring",          desc: "Recalculate composite trust scores for all retailers" },
  { id: "agent_3_risk_intelligence",    label: "Agent 3 — Risk Intelligence",      desc: "Scan for credit risk, scheme leakage, and return fraud" },
  { id: "agent_4_action_recommendation",label: "Agent 4 — Action Recommendations", desc: "Generate strategic action recommendations for distributor" },
  { id: "agent_5_demand_forecast",      label: "Agent 5 — Demand Forecast",        desc: "Estimate secondary sales velocity by SKU and zone" },
  { id: "agent_6_beat_intelligence",    label: "Agent 6 — Beat Intelligence",      desc: "Optimize salesman beat routes based on visit data" },
];

type RunRecord = { agent: string; status: string; result: any; timestamp: string };

export default function AgentTriggerPanel() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].id);
  const [payload, setPayload] = useState("{}");
  const [running, setRunning] = useState(false);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);
  const [payloadError, setPayloadError] = useState("");

  const agentInfo = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0];

  const handleRun = async () => {
    setPayloadError("");
    let parsed: any = {};
    try { parsed = JSON.parse(payload); } catch {
      setPayloadError("Invalid JSON — please check your payload.");
      return;
    }

    setRunning(true);
    const startTime = new Date().toISOString();
    try {
      const { runAgent } = await import("@/lib/api-client");
      const result = await runAgent(selectedAgent as any, parsed);
      const record: RunRecord = { agent: selectedAgent, status: "SUCCESS", result, timestamp: startTime };
      setRunHistory(prev => [record, ...prev.slice(0, 9)]);
      toast.success(`${agentInfo.label} completed`);
    } catch (e: any) {
      const record: RunRecord = { agent: selectedAgent, status: "ERROR", result: { error: e.message }, timestamp: startTime };
      setRunHistory(prev => [record, ...prev.slice(0, 9)]);
      toast.error(`Agent run failed: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-indigo-400" /> Agent Pipeline Control
        </h2>
        <p className="text-sm text-slate-400 mt-1">Manually trigger AI agents for testing, re-runs, and diagnostics.</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-400">
          ⚠️ Dev/Admin tool — agent runs may write alerts and scores to the database.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agent selector */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Select Agent</label>
            <div className="relative">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
              >
                {AGENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500 mt-2">{agentInfo.desc}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Input Payload (JSON)</label>
            <textarea
              value={payload}
              onChange={(e) => { setPayload(e.target.value); setPayloadError(""); }}
              rows={6}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              placeholder='{"key": "value"}'
            />
            {payloadError && <p className="text-xs text-rose-400 mt-1">{payloadError}</p>}
          </div>

          <button
            onClick={handleRun}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            {running ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> Run Agent</>}
          </button>
        </div>

        {/* Run History */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 block">Run History (Session)</label>
          {runHistory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500 text-sm">
              No runs yet. Trigger an agent to see results here.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {runHistory.map((run, i) => (
                <div key={i} className={`border rounded-xl p-4 text-xs ${run.status === "SUCCESS" ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
                  <div className="flex justify-between mb-2">
                    <span className={`font-semibold ${run.status === "SUCCESS" ? "text-emerald-400" : "text-rose-400"}`}>
                      {run.status}
                    </span>
                    <span className="text-slate-500 font-mono">{new Date(run.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-400 mb-2">{AGENTS.find(a => a.id === run.agent)?.label || run.agent}</p>
                  <pre className="bg-black/30 rounded-lg p-2 text-slate-300 overflow-x-auto max-h-24 whitespace-pre-wrap break-all">
                    {JSON.stringify(run.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
