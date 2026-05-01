"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Package, Calendar, Percent } from "lucide-react";
import { toast } from "sonner";

const STATUS_CLASS = (valid_to: string) => {
  const isExpired = new Date(valid_to) < new Date();
  return isExpired
    ? "text-slate-400 bg-slate-800 border-slate-700"
    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
};

export default function SchemesManagementPanel() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    brand: "", scheme_name: "", discount_percent: "", min_quantity: "1",
    valid_from: "", valid_to: "", source: "manual",
  });

  useEffect(() => {
    import("@/lib/api-client").then(({ listSchemes }) => {
      listSchemes().then((d: any) => { setSchemes(d?.schemes || []); setLoading(false); }).catch(() => setLoading(false));
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { createScheme } = await import("@/lib/api-client");
      const result = await createScheme({
        brand: form.brand,
        scheme_name: form.scheme_name,
        discount_percent: parseFloat(form.discount_percent),
        min_quantity: parseInt(form.min_quantity) || 1,
        valid_from: form.valid_from,
        valid_to: form.valid_to,
        source: form.source,
      });
      toast.success(`Scheme "${form.scheme_name}" created`);
      setSchemes(prev => [result, ...prev]);
      setShowCreate(false);
      setForm({ brand: "", scheme_name: "", discount_percent: "", min_quantity: "1", valid_from: "", valid_to: "", source: "manual" });
    } catch (e: any) {
      toast.error(e.message || "Failed to create scheme");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" /> Scheme Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage brand promotional schemes and discount tracking.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Scheme
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">Create New Scheme</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Brand Name", key: "brand", placeholder: "e.g. HUL, Nestle, Tata" },
                { label: "Scheme Name", key: "scheme_name", placeholder: "e.g. Surf Excel Summer Offer" },
                { label: "Discount %", key: "discount_percent", placeholder: "e.g. 12.5", type: "number" },
                { label: "Min Quantity", key: "min_quantity", placeholder: "e.g. 5", type: "number" },
                { label: "Valid From", key: "valid_from", type: "date" },
                { label: "Valid To", key: "valid_to", type: "date" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    required type={type || "text"} placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              ))}
              <button type="submit" disabled={creating} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-medium text-sm mt-2">
                {creating ? "Creating..." : "Create Scheme"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Scheme List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">{[0,1,2].map(i => <div key={i} className="h-20 bg-slate-900 rounded-xl border border-slate-800" />)}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-slate-800 border-dashed rounded-xl">
          <Package className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p>No schemes yet. Create your first scheme above.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {schemes.map((s: any) => (
            <div key={s.id || s.scheme_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-white">{s.scheme_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.brand || s.brand_id}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${STATUS_CLASS(s.valid_to)}`}>
                  {new Date(s.valid_to) < new Date() ? "Expired" : "Active"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <Percent className="w-3 h-3 mx-auto mb-1 text-blue-400" />
                  <span className="font-mono font-bold text-blue-400">{s.discount_percent}%</span>
                  <p className="text-slate-500 mt-0.5">Discount</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <Calendar className="w-3 h-3 mx-auto mb-1 text-slate-400" />
                  <span className="text-slate-300">{s.valid_from ? new Date(s.valid_from).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</span>
                  <p className="text-slate-500 mt-0.5">From</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <Calendar className="w-3 h-3 mx-auto mb-1 text-slate-400" />
                  <span className="text-slate-300">{s.valid_to ? new Date(s.valid_to).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</span>
                  <p className="text-slate-500 mt-0.5">To</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 capitalize">{s.source || "manual"}</span>
                {s.min_quantity > 1 && <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Min qty: {s.min_quantity}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
