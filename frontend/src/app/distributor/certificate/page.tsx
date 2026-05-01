"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Download, CheckCircle2, RefreshCw, Search, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const tierColors: Record<string, string> = {
  A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  B: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  C: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  D: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function CertificatePage() {
  const [retailers, setRetailers] = useState<any[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedCert, setGeneratedCert] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    import("@/lib/api-client").then(({ getRetailers }) => {
      getRetailers().then((data) => setRetailers(data?.retailers || [])).catch(() => {});
    });
  }, []);

  const handleSelectRetailer = async (r: any) => {
    setSelectedRetailer(r);
    setGeneratedCert(null);
    setHistoryLoading(true);
    try {
      const { getCertificateHistory } = await import("@/lib/api-client");
      const data = await getCertificateHistory(r.id);
      setHistory(data?.certificates || []);
    } catch { setHistory([]); } finally { setHistoryLoading(false); }
  };

  const handleGenerate = async () => {
    if (!selectedRetailer) return;
    setGenerating(true);
    try {
      const { generateCertificate } = await import("@/lib/api-client");
      const cert = await generateCertificate(selectedRetailer.id, "distributor");
      setGeneratedCert(cert);
      toast.success("Certificate generated successfully");
      // Refresh history
      const { getCertificateHistory } = await import("@/lib/api-client");
      const data = await getCertificateHistory(selectedRetailer.id);
      setHistory(data?.certificates || []);
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally { setGenerating(false); }
  };

  const downloadPdf = () => {
    if (!generatedCert?.pdf_url) return;
    const a = document.createElement("a");
    a.href = generatedCert.pdf_url;
    a.download = `VendorLock-Trust-Cert-${generatedCert.certificate_id}.pdf`;
    a.click();
  };

  const filtered = retailers.filter((r) =>
    `${r.name} ${r.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050d1a] text-white p-6 md:p-10">
      <motion.div {...fadeUp} className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
              <Shield className="w-4 h-4" /> Trust Intelligence
            </div>
            <h1 className="text-3xl font-black tracking-tight">Trust Certificate Generator</h1>
            <p className="text-slate-400 text-sm mt-1">Generate AI-signed, tamper-proof certificates for retailers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Retailer Picker */}
          <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="lg:col-span-5 space-y-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-slate-200 mb-4">Select Retailer</h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filtered.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No retailers found.</p>}
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRetailer(r)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedRetailer?.id === r.id
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                      {r.name?.[0] || "R"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 text-sm truncate">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.phone}</div>
                    </div>
                    {r.tier && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${tierColors[r.tier] || tierColors.B}`}>{r.tier}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] py-3 text-base font-semibold flex items-center justify-center gap-2 transition-all"
              disabled={!selectedRetailer || generating}
              onClick={handleGenerate}
            >
              {generating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Shield className="w-4 h-4" /> Generate Certificate</>}
            </Button>
          </motion.div>

          {/* Right: Certificate Preview + History */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="lg:col-span-7 space-y-4">
            <AnimatePresence mode="wait">
              {generatedCert ? (
                <motion.div key="cert" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-slate-900/60 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
                  {/* Glow */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                        <CheckCircle2 className="w-4 h-4" /> Certificate Generated
                      </div>
                      <p className="font-mono text-slate-300 text-sm">{generatedCert.certificate_id}</p>
                    </div>
                    <span className={`text-xl font-black px-3 py-1.5 rounded-lg border ${tierColors[generatedCert.tier] || tierColors.B}`}>
                      Tier {generatedCert.tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Trust Score", value: `${generatedCert.trust_score?.toFixed(1)} / 100` },
                      { label: "Payment Discipline", value: `${generatedCert.payment_discipline_pct?.toFixed(1)}%` },
                      { label: "Consistency Index", value: generatedCert.consistency_index?.toFixed(2) },
                      { label: "Months of History", value: generatedCert.months_of_history },
                    ].map((m) => (
                      <div key={m.label} className="bg-slate-800/60 rounded-lg p-3">
                        <div className="text-xs text-slate-500 uppercase tracking-wider">{m.label}</div>
                        <div className="text-lg font-bold text-white mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2"
                      onClick={downloadPdf}>
                      <Download className="w-4 h-4" /> Download PDF
                    </Button>
                    <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2"
                      onClick={() => window.open(generatedCert.qr_verification_url, "_blank")}>
                      <ExternalLink className="w-4 h-4" /> View Verify Page
                    </Button>
                  </div>
                </motion.div>
              ) : selectedRetailer ? (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-slate-900/40 border border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
                  <Shield className="w-10 h-10 text-slate-600" />
                  <p className="text-slate-400 text-sm">Click <strong>Generate Certificate</strong> to create a signed PDF for <span className="text-slate-300">{selectedRetailer.name}</span></p>
                </motion.div>
              ) : (
                <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-slate-900/40 border border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
                  <Shield className="w-10 h-10 text-slate-600" />
                  <p className="text-slate-400 text-sm">Select a retailer on the left to get started</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Certificate History */}
            {selectedRetailer && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Certificate History
                </h3>
                {historyLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-3"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div>
                ) : history.length === 0 ? (
                  <p className="text-slate-500 text-sm py-2">No certificates issued yet for this retailer.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((c: any) => (
                      <div key={c.certificate_code} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-slate-300">{c.certificate_code}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{c.issued_at ? new Date(c.issued_at).toLocaleDateString("en-IN") : "—"}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${tierColors[c.tier] || tierColors.B}`}>{c.tier}</span>
                        <button onClick={() => window.open(c.qr_verification_url, "_blank")} className="text-slate-500 hover:text-slate-300 transition">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
