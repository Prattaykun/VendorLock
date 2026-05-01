import { useState, useMemo } from "react";
import { formatInr, formatDateStable } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Box } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderDetailModal from "@/components/dashboard/OrderDetailModal";

export default function OrdersPanel({ orders, setOrders, retailers }: { orders: any[], setOrders: (o: any[]) => void, retailers: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const retailerName = o.retailers?.name || o.retailerName || "Unknown Retailer";
      const matchSearch = retailerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 w-full">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Order Management</h2>
          <p className="text-sm text-slate-400 mt-1">Review, confirm, and dispute retailer orders.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search orders or retailers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700 w-64 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Orders</SelectItem>
              <SelectItem value="PENDING_CONFIRMATION">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="DISPUTED">Disputed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Retailer</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Box className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">{order.id.split('-')[0] + '...'}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {order.retailers?.name || order.retailerName || "Retailer #" + order.retailerId?.substring(0,4)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatInr(order.total_amount || order.orderValue)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`
                        ${order.status === 'CONFIRMED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : ''}
                        ${order.status === 'PENDING_CONFIRMATION' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : ''}
                        ${order.status === 'BLOCKED' || order.status === 'DISPUTED' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : ''}
                        ${order.status === 'CANCELLED' ? 'border-slate-500/30 text-slate-400 bg-slate-500/10' : ''}
                      `}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDateStable(order.created_at || order.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}
