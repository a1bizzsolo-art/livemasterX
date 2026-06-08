import React from "react";
import { Activity, Database, Leaf, Users, Briefcase, TrendingUp } from "lucide-react";

const ENGINES = [
  {
    id: "subscription",
    icon: TrendingUp,
    k: "01",
    name: "Per-Acre Subscription",
    headline: "$4.20 / acre / year — locked.",
    body: "Foundational SaaS revenue. Multi-year contracts compound LTV; 28% discount unlocks the 10-year commitment.",
    tags: ["Recurring", "TCV-priced", "Auto-renewing"],
  },
  {
    id: "implementation",
    icon: Briefcase,
    k: "02",
    name: "Implementation & Onboarding",
    headline: "$10k — $150k one-time.",
    body: "High-margin onboarding tied to deployment scale. Funds the operator's first-90-day services and books revenue same quarter.",
    tags: ["One-time", "High margin", "Same-quarter"],
  },
  {
    id: "addons",
    icon: Activity,
    k: "03",
    name: "Premium Add-Ons",
    headline: "+30–70% ACV.",
    body: "Priority orbital revisit, dedicated agent quorums, on-call ops engineers. Stack at quote-time; recur annually.",
    tags: ["Per-acre", "Flat-annual", "Bolt-on"],
  },
  {
    id: "yieldshare",
    icon: Leaf,
    k: "04",
    name: "Yield Performance Program",
    headline: "8% of measured uplift.",
    body: "Operator pays nothing extra unless yield rises. Satellite + sensor baseline locks the verification — pure upside revenue.",
    tags: ["Pay-on-performance", "Auditable", "Customer-loved"],
  },
  {
    id: "data",
    icon: Database,
    k: "05",
    name: "Data Cooperative",
    headline: "$50k — $500k / buyer / year.",
    body: "Anonymized NDVI + yield + moisture aggregates licensed to reinsurance carriers, commodities desks and ag lenders.",
    tags: ["Licensing", "Multi-buyer", "Opt-in customer credits"],
  },
  {
    id: "carbon",
    icon: Users,
    k: "06",
    name: "Carbon Credit MRV",
    headline: "25% of credit revenue.",
    body: "Satellite-verified measurement, reporting & verification. Customer keeps 75%, we keep 25% — and we never touch hardware.",
    tags: ["Revshare", "Network-effect", "ESG-grade"],
  },
];

export default function RevenueStack() {
  return (
    <section id="revenue-stack" className="relative border-b border-slate-800 bg-[#08090b]">
      <div className="absolute inset-0 grid-bg-dense opacity-40 pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24 relative">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 07</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            REVENUE STACK // SIX ENGINES, ONE OPERATOR
          </span>
        </div>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
            Six revenue layers. <br />
            <span className="text-amber-400">One platform.</span>
          </h2>
          <p className="max-w-md text-xs text-slate-400 leading-relaxed">
            AQAS doesn't bill once. It bills six ways — subscription, onboarding,
            add-ons, performance, data, carbon — every layer compounding the next.
            Same agent quorum. Same satellite passes. Six lines of revenue.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-slate-800">
          {ENGINES.map((e, i) => (
            <div
              key={e.id}
              data-testid={`engine-${e.id}`}
              className={`p-6 lg:p-8 border-b border-r border-slate-800
                ${(i + 1) % 2 === 0 ? "border-r-0 md:border-r" : ""}
                ${(i + 1) % 3 === 0 ? "lg:border-r-0" : ""}
                ${i >= ENGINES.length - 3 ? "lg:border-b-0" : ""}
                ${i >= ENGINES.length - 2 ? "md:border-b-0 lg:border-b-0" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center border border-amber-500/50 bg-amber-500/5">
                  <e.icon className="h-4 w-4 text-amber-400" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-mono tracking-[0.24em] text-slate-500">// {e.k}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-tight text-white">
                {e.name}
              </h3>
              <div className="mt-2 text-amber-400 font-mono text-sm">{e.headline}</div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">{e.body}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {e.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] uppercase tracking-[0.22em] border border-slate-700 px-2 py-1 text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
