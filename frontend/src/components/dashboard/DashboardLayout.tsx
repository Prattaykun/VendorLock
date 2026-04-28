import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Shield, BarChart3 } from "lucide-react";

import { Alert } from "@/types/dashboard";

type DashboardLayoutProps = {
  children: ReactNode;
  criticalAlerts: Alert[];
};

const navItems = [
  { label: "Command Center", href: "/", icon: Shield },
  { label: "Analytics", href: "/company", icon: BarChart3 },
  { label: "Trust Map", href: "#", icon: null },
  { label: "Credit Decision", href: "#", icon: null },
  { label: "Scheme Leakage", href: "#", icon: null },
  { label: "Beat Intelligence", href: "#", icon: null },
  { label: "Expiry & Returns", href: "#", icon: null },
  { label: "Audit Trail", href: "#", icon: null },
];

export default function DashboardLayout({
  children,
  criticalAlerts,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const unresolvedCriticalAlerts = criticalAlerts.filter(
    (alert) => alert.type === "CRITICAL" && !alert.resolved,
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-900 text-slate-100 lg:border-b-0 lg:border-r lg:sticky lg:top-0 lg:h-screen">
          <div className="border-b border-slate-700 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
              VendorLock
            </p>
            <h1 className="mt-2 text-xl font-semibold">Distributor Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">Ravi Control Tower</p>
          </div>

          <nav className="overflow-x-auto px-3 py-3 lg:overflow-visible">
            <ul className="flex gap-2 lg:flex-col">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500 border-r-2 border-blue-500"
                          : "text-slate-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.icon && <item.icon size={18} />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-red-200 bg-white/95 backdrop-blur">
            {unresolvedCriticalAlerts.length > 0 ? (
              <div className="space-y-2 px-4 py-3 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Unresolved Critical Alerts
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {unresolvedCriticalAlerts.map((alert) => (
                    <article
                      key={alert.id}
                      className="rounded-xl border border-red-300 bg-red-50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-red-900">{alert.title}</p>
                      <p className="text-xs text-red-800">{alert.message}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 sm:px-6">
                <p className="text-sm text-emerald-700">No unresolved CRITICAL alerts.</p>
              </div>
            )}
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </section>
      </div>
    </div>
  );
}
