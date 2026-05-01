"use client";

import { useEffect, useState } from "react";
import { getTelegramMessages } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MessageMonitoringPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const data = await getTelegramMessages(50);
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "ORDER": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PAYMENT": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "DISPUTE": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <Card className="bg-[#0a0a0a] border-zinc-800 text-zinc-100 flex flex-col h-[500px]">
      <CardHeader className="border-b border-zinc-800 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-zinc-400 text-lg">forum</span>
            Live Telegram Feed
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Polling active
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">No recent messages</div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm text-zinc-200">{msg.sender}</span>
                  <span className="text-xs text-zinc-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded p-3 mb-2">
                  <p className="text-sm text-zinc-300 font-hindi-sans">{msg.text}</p>
                  {msg.translation && msg.translation !== msg.text && (
                    <p className="text-xs text-zinc-500 mt-1 italic border-t border-zinc-800/50 pt-1">"{msg.translation}"</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getIntentColor(msg.intent)}>
                      {msg.intent}
                    </Badge>
                    <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
                      Conf: {(msg.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{msg.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
