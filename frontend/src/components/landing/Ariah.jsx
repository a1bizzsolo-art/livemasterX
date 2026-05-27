import React from "react";
import { Target, Mail, Briefcase, FileSignature, ArrowRight } from "lucide-react";

const PIPELINE = [
  { stage: "LEAD HARVEST", tool: "Apollo // Custom Scrapers", count: 1820, color: "text-amber-400" },
  { stage: "QUALIFY", tool: "Pluto Index Scoring", count: 743, color: "text-amber-400" },
  { stage: "OUTREACH", tool: "Instantly // Multi-channel", count: 412, color: "text-emerald-400" },
  { stage: "CRM SYNC", tool: "Native // HubSpot bridge", count: 287, color: "text-emerald-400" },
  { stage: "PROPOSAL", tool: "AQAS-drafted contracts", count: 64, color: "text-emerald-400" },
  { stage: "SIGNED", tool: "Stripe // automated billing", count: 27, color: "text-white" },
];

const SUB = [
  { icon: Target, title: "Lead Scraping", desc: "Continuous prospect ingestion via Apollo, custom crawlers, and intent triggers." },
  { icon: Mail, title: "Outreach Engine", desc: "Instantly + Smartlead orchestrated, agent-personalized, deliverability-tuned." },
  { icon: Briefcase, title: "Built-in CRM", desc: "Native pipeline with HubSpot bridge. No SaaS toll, no sync lag." },
  { icon: FileSignature, title: "Proposal Generation", desc: "AQAS authors, prices and dispatches contracts. Stripe closes the loop." },
];

export default function Ariah() {
  return (
    <section id="ariah" className="relative border-b border-slate-800 bg-[#08090b]">
      <div className="absolute inset-0 grid-bg-dense opacity-50 pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24 relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-amber-400">// 03</span>
            <span className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">ARIAH // AUTONOMOUS SALES ENGINE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
            Pipeline that hunts <span className="text-amber-400">while you sleep.</span>
          </h2>
          <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">
            Ariah is the revenue arm of the 10^4 agent swarm. Scrapes, qualifies, contacts, books and closes —
            in a single autonomous loop, supervised by AQAS.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-12 gap-0 border border-slate-800">
          {/* Pipeline visual */}
          <div className="lg:col-span-7 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">// LIVE PIPELINE TELEMETRY</div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
                <span>STREAMING</span>
              </div>
            </div>

            <div className="space-y-2">
              {PIPELINE.map((p, i) => {
                const max = PIPELINE[0].count;
                const pct = Math.max(8, Math.round((p.count / max) * 100));
                return (
                  <div key={p.stage} data-testid={`pipeline-${i}`} className="border border-slate-800">
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-3 px-4 py-3 border-r border-slate-800">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">stage {String(i + 1).padStart(2, "0")}</div>
                        <div className="font-display text-sm font-bold uppercase tracking-tight">{p.stage}</div>
                      </div>
                      <div className="col-span-6 px-4 py-3 border-r border-slate-800">
                        <div className="text-[10px] text-slate-500 mb-1.5">{p.tool}</div>
                        <div className="relative h-1.5 bg-slate-900 border border-slate-800">
                          <div
                            className={`absolute inset-y-0 left-0 ${p.color.includes("emerald") ? "bg-emerald-400/80" : p.color.includes("white") ? "bg-white" : "bg-amber-400/80"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 px-4 py-3 text-right">
                        <div className={`font-display text-2xl font-black ${p.color}`}>{p.count.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">last 30d</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-capabilities */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
            {SUB.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`p-6 lg:p-7 border-b last:border-b-0 ${i % 2 === 0 ? "sm:border-r lg:border-r-0" : ""} border-slate-800`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center border border-amber-500/50 bg-amber-500/5">
                    <Icon className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <h3 className="font-display text-base font-bold uppercase tracking-tight">{title}</h3>
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">{desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-amber-400">
                  Autonomous <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
