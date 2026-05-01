import { useState, useEffect } from "react";
import { formatInr, formatDateStable } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertTriangle, Trash2, Loader2, Package } from "lucide-react";
import { confirmOrder, disputeOrder, cancelOrder, getOrder } from "@/lib/api-client";

export default function OrderDetailModal({ order: initialOrder, onClose, onUpdateStatus }: { order: any, onClose: () => void, onUpdateStatus: (id: string, status: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [orderDetail, setOrderDetail] = useState<any>(initialOrder);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    // Fetch full order details including items
    if (initialOrder.id) {
      getOrder(initialOrder.id).then((data) => {
        if (data && data.order_items) {
          setOrderDetail(data);
        }
      }).finally(() => setLoadingItems(false));
    } else {
      setLoadingItems(false);
    }
  }, [initialOrder.id]);

  const handleAction = async (action: 'confirm' | 'dispute' | 'cancel') => {
    if (action === 'dispute' && !disputing) {
      setDisputing(true);
      return;
    }

    setLoading(true);
    try {
      if (action === 'confirm') {
        await confirmOrder(orderDetail.id);
        onUpdateStatus(orderDetail.id, "CONFIRMED");
      } else if (action === 'dispute') {
        await disputeOrder(orderDetail.id, disputeReason);
        onUpdateStatus(orderDetail.id, "DISPUTED");
        setDisputing(false);
      } else if (action === 'cancel') {
        await cancelOrder(orderDetail.id);
        onUpdateStatus(orderDetail.id, "CANCELLED");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isTerminal = ['CONFIRMED', 'CANCELLED', 'BLOCKED', 'DISPUTED'].includes(orderDetail.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/40">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">
                {orderDetail.retailers?.name || orderDetail.retailerName || "Retailer Order"}
              </h3>
              <Badge variant="outline" className="bg-slate-800/50">{orderDetail.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">{orderDetail.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Total Value</p>
              <p className="text-lg font-mono font-bold text-white">{formatInr(orderDetail.total_amount || orderDetail.orderValue)}</p>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Date Captured</p>
              <p className="text-sm font-medium text-slate-300">{formatDateStable(orderDetail.created_at || orderDetail.createdAt)}</p>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Channel & Payment</p>
              <p className="text-sm font-medium text-slate-300 capitalize">
                {orderDetail.channel || "dashboard"} • {orderDetail.payment_type || "credit"}
              </p>
            </div>
          </div>

          {/* Raw Message (if from Telegram) */}
          {orderDetail.raw_message && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Original Chat Intent</h4>
              <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-3 text-sm text-blue-200/80 italic">
                "{orderDetail.raw_message}"
              </div>
            </div>
          )}

          {/* Line Items */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Order Items
            </h4>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80 text-slate-400 text-xs">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 bg-slate-900/30">
                  {loadingItems ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Loading items...
                      </td>
                    </tr>
                  ) : orderDetail.order_items?.length ? (
                    orderDetail.order_items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-300">{item.products?.name || "Unknown Product"}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-slate-400 font-mono">{formatInr(item.unit_price)}</td>
                        <td className="py-2 px-3 text-right text-slate-200 font-mono font-medium">{formatInr(item.total_price)}</td>
                      </tr>
                    ))
                  ) : orderDetail.items && Array.isArray(orderDetail.items) ? (
                     orderDetail.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-300">{item.product_name || item}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{item.quantity || '-'}</td>
                        <td className="py-2 px-3 text-right text-slate-400 font-mono">{item.unit_price ? formatInr(item.unit_price) : '-'}</td>
                        <td className="py-2 px-3 text-right text-slate-200 font-mono font-medium">-</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">No item details available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Dispute Reason Input */}
          {disputing && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 animate-in slide-in-from-top-2">
              <label className="block text-xs font-medium text-amber-500/80 mb-2 uppercase tracking-wider">Dispute Reason (sent to retailer)</label>
              <textarea 
                className="w-full bg-slate-950 border border-amber-500/50 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={2}
                placeholder="e.g. Quantity requested exceeds available limits"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isTerminal && (
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
            <Button variant="ghost" className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => handleAction('cancel')} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
            
            <div className="flex gap-3">
              {disputing ? (
                <>
                  <Button variant="ghost" onClick={() => setDisputing(false)} className="text-slate-400">Cancel</Button>
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white" onClick={() => handleAction('dispute')} disabled={loading || !disputeReason}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                    Submit Dispute
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={() => handleAction('dispute')} disabled={loading}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Dispute
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => handleAction('confirm')} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Confirm Order
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
