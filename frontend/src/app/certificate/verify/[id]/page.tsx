"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Shield, Clock, RefreshCw, AlertTriangle } from "lucide-react";

const tierColors: Record<string, string> = {
  A: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-400",
  B: "from-blue-500/20 to-blue-500/5 border-blue-500/40 text-blue-400",
  C: "from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-400",
  D: "from-rose-500/20 to-rose-500/5 border-rose-500/40 text-rose-400",
};

export default function CertificateVerifyPage({ params }: { params: { id: string } }) {
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/certificate/verify/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCert(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [params.id]);

  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-4">
            <Shield className="w-4 h-4" />
            VendorLock Certificate Verification
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Trust Certificate</h1>
          <p className="text-slate-400 text-sm mt-2">Certificate ID: <span className="font-mono text-slate-300">{params.id}</span></p>
        </div>

        {loading && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-slate-400 text-sm">Verifying certificate...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <p className="text-rose-400 font-semibold">Verification Failed</p>
            <p className="text-slate-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && cert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Valid / Invalid Banner */}
            <div className={`rounded-2xl p-6 border text-center ${
              cert.valid
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-rose-500/10 border-rose-500/30"
            }`}>
              {cert.valid ? (
                <>
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                  <p className="text-xl font-bold text-emerald-400">Certificate Verified ✓</p>
                  <p className="text-emerald-300/70 text-sm mt-1">This certificate is authentic and tamper-free.</p>
                </>
              ) : (
                <>
                  <XCircle className="w-14 h-14 text-rose-400 mx-auto mb-3" />
                  <p className="text-xl font-bold text-rose-400">Verification Failed</p>
                  <p className="text-rose-300/70 text-sm mt-1">{cert.reason || "Certificate may have been tampered with."}</p>
                </>
              )}
            </div>

            {cert.valid && (
              <>
                {/* Tier Badge */}
                {cert.tier && (
                  <div className={`rounded-xl p-5 border bg-gradient-to-br ${tierColors[cert.tier] || tierColors.B}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium opacity-70">Retailer Trust Tier</span>
                      <span className="text-4xl font-black">{cert.tier}</span>
                    </div>
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-current transition-all duration-700"
                        style={{ width: `${(cert.trust_score || 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs opacity-60 mt-1">
                      <span>0</span>
                      <span className="font-mono font-bold text-base opacity-100">{cert.trust_score?.toFixed(1)} / 100</span>
                      <span>100</span>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 grid grid-cols-2 gap-4">
                  {[
                    { label: "Payment Discipline", value: cert.payment_discipline_pct ? `${cert.payment_discipline_pct.toFixed(1)}%` : "—" },
                    { label: "Consistency Index", value: cert.consistency_index ? cert.consistency_index.toFixed(2) : "—" },
                    { label: "Months of History", value: cert.months_of_history ?? "—" },
                    { label: "Issuer", value: cert.issuer || "VendorLock AI" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</span>
                      <span className="text-base font-semibold text-slate-200 mt-0.5">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Validity */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <div className="text-slate-300">
                      Issued: <span className="font-mono">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("en-IN", { dateStyle: "long" }) : "—"}</span>
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Valid until: <span className="font-mono">{cert.valid_until ? new Date(cert.valid_until).toLocaleDateString("en-IN", { dateStyle: "long" }) : "1 year"}</span>
                    </div>
                  </div>
                  {cert.tamper_detected && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <AlertTriangle className="w-4 h-4" /> Tamper flag
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <p className="text-center text-xs text-slate-600 pt-2">
              Powered by VendorLock AI · Cryptographically signed · Verify at vendorlock.in
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
