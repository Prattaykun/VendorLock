"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRetailer } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";

export default function RetailerOnboardPage() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
    gstin: "",
    telegram_chat_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const payload: any = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
      };
      if (form.gstin.trim()) payload.gstin = form.gstin.trim();
      if (form.telegram_chat_id.trim()) payload.telegram_chat_id = parseInt(form.telegram_chat_id, 10);

      const result = await createRetailer(payload);
      setSuccess(result);
    } catch (err: any) {
      setError(err.message || "Failed to onboard retailer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none rounded-2xl" />
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Retailer Onboarded!</h2>
            <p className="text-zinc-400 mb-6">{success.name} has been added to your network.</p>
            <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Retailer ID</span>
                <span className="text-zinc-200 font-mono text-xs">{success.retailer_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Initial Trust Score</span>
                <span className="text-amber-400 font-bold">{success.initial_trust_score}/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tier</span>
                <span className="text-orange-400 font-semibold">Tier {success.initial_tier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Credit Limit</span>
                <span className="text-zinc-200 font-mono">₹{success.credit_limit?.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSuccess(null); setForm({ name: "", mobile: "", address: "", pincode: "", gstin: "", telegram_chat_id: "" }); }}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all font-medium"
              >
                Onboard Another
              </button>
              <button
                onClick={() => router.push("/distributor")}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">Onboard New Retailer</h1>
              <p className="text-zinc-400 text-sm">Add a new kirana or retail outlet to your network.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="ret-name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="ret-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Rao Mart"
                />
              </div>

              <div>
                <label htmlFor="ret-mobile" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="ret-mobile"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={form.mobile}
                  onChange={update("mobile")}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  placeholder="9801234567"
                />
              </div>

              <div>
                <label htmlFor="ret-address" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="ret-address"
                  required
                  rows={2}
                  value={form.address}
                  onChange={update("address")}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  placeholder="Shop 12, Station Road, Bhandup East"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ret-pincode" className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Pincode <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ret-pincode"
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={form.pincode}
                    onChange={update("pincode")}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                    placeholder="400042"
                  />
                </div>
                <div>
                  <label htmlFor="ret-gstin" className="block text-sm font-medium text-zinc-300 mb-1.5">
                    GSTIN <span className="text-zinc-600 text-xs">(optional)</span>
                  </label>
                  <input
                    id="ret-gstin"
                    type="text"
                    value={form.gstin}
                    onChange={update("gstin")}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm"
                    placeholder="27AABCU9603R1ZX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ret-tgchat" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Telegram Chat ID <span className="text-zinc-600 text-xs">(optional — for order bot)</span>
                </label>
                <input
                  id="ret-tgchat"
                  type="number"
                  value={form.telegram_chat_id}
                  onChange={update("telegram_chat_id")}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  placeholder="e.g. 123456789"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  id="onboard-submit"
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Onboarding...
                    </span>
                  ) : (
                    "Onboard Retailer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
