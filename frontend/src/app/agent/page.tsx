"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Play, CheckCircle2, AlertCircle, Clock, SearchCode } from "lucide-react";

const AGENTS = [
  { id: "agent1", name: "Trade Capture & Normalisation", desc: "Parses WhatsApp/Telegram NLP to structured JSON", status: "online", lastRun: "2 mins ago", success: "99.8%" },
  { id: "agent2", name: "Trust & Behaviour Scoring", desc: "Updates retailer scores based on payment behavior", status: "online", lastRun: "15 mins ago", success: "100%" },
  { id: "agent3", name: "Risk, Scheme & Compliance", desc: "RAG over PDF schemes to detect margin leakage", status: "online", lastRun: "1 hour ago", success: "98.5%" },
  { id: "agent4", name: "Action & Recommendation", desc: "Generates push notifications and dispute triggers", status: "online", lastRun: "5 mins ago", success: "99.1%" },
  { id: "agent5", name: "Demand & Pre-Stock Forecast", desc: "Predicts SKUs likely to stock out", status: "offline", lastRun: "12 hours ago", success: "95.0%" },
  { id: "agent6", name: "Beat Intelligence & Coverage", desc: "Analyzes salesman GPS vs retailer coordinates", status: "online", lastRun: "10 mins ago", success: "97.2%" },
];

export default function AgentPipelinePage() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].id);
  const [testPayload, setTestPayload] = useState('{\n  "message": "bhai 5 peti parmal bhej de",\n  "sender": "RET-102"\n}');
  const [testOutput, setTestOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTest = () => {
    setIsRunning(true);
    setTestOutput("");
    setTimeout(() => {
      setTestOutput(JSON.stringify({
        intent: "ORDER",
        entities: [
          { item: "parmal", quantity: 5, unit: "peti" }
        ],
        confidence: 0.98,
        language: "hinglish"
      }, null, 2));
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-black tracking-tight">AI Agent Pipeline</h1>
          </div>
          <p className="text-slate-400">Monitor LangGraph execution, review agent health, and test multi-agent prompts.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-blue-400" /> Active Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENTS.map(agent => (
                <Card 
                  key={agent.id} 
                  className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${selectedAgent === agent.id ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : 'hover:border-slate-600'}`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-200">{agent.name}</div>
                      {agent.status === 'online' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> OK</Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"><AlertCircle className="w-3 h-3 mr-1"/> Offline</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-4 h-8">{agent.desc}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {agent.lastRun}</span>
                      <span className="font-mono text-emerald-500">{agent.success} SR</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Test Console */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" /> Test Console
            </h2>
            <Card className="bg-slate-900 border-slate-800 h-[calc(100%-2rem)] flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Target: {AGENTS.find(a => a.id === selectedAgent)?.name}
                </CardTitle>
                <CardDescription className="text-xs">Provide JSON payload to trigger agent graph</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Input Payload</label>
                  <Textarea 
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="flex-1 min-h-[150px] font-mono text-xs bg-black border-slate-800 text-green-400 focus-visible:ring-indigo-500" 
                  />
                </div>
                
                <Button 
                  onClick={handleRunTest} 
                  disabled={isRunning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isRunning ? "Executing Graph..." : "Invoke Agent"}
                </Button>

                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Agent Output (JSON)</label>
                  <div className="flex-1 min-h-[150px] bg-black border border-slate-800 rounded-md p-3 overflow-auto">
                    {isRunning ? (
                      <div className="h-full flex items-center justify-center text-slate-600 text-sm animate-pulse">Processing...</div>
                    ) : (
                      <pre className="font-mono text-xs text-blue-400 whitespace-pre-wrap">{testOutput || "// Ready for execution"}</pre>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
