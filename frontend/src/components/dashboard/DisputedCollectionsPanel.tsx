"use client";

import { useEffect, useState } from "react";
import { getDisputedCollections } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DisputedCollectionsPanel() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      const data = await getDisputedCollections();
      // Add some mock data if empty for MVP presentation
      if (data.length === 0) {
        setDisputes([
          { id: "101", retailer: "Ramesh Kirana", salesman: "Raju", amount: 5000, timestamp: new Date().toISOString(), status: "INVESTIGATING", reason: "Retailer claims he paid 5000 but salesman recorded 4000" }
        ]);
      } else {
        setDisputes(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <Card className="bg-[#0a0a0a] border-zinc-800 text-zinc-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-500">
          <span className="material-symbols-outlined text-rose-500">warning</span>
          Disputed Collections (Dual-Confirmation)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-zinc-500">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="text-zinc-500">No active disputes. All collections confirmed by retailers.</div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="bg-zinc-900 border border-rose-900/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-zinc-100">{dispute.retailer}</h4>
                    <p className="text-xs text-zinc-500">Collected by: {dispute.salesman}</p>
                  </div>
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
                    ₹{dispute.amount.toLocaleString()}
                  </Badge>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-sm text-zinc-300 mb-3">
                  <span className="text-zinc-500">Dispute Reason: </span>
                  {dispute.reason}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">{new Date(dispute.timestamp).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button className="text-zinc-400 hover:text-white transition-colors">View Chat</button>
                    <button className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">Resolve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
