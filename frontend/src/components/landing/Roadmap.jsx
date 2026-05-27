import React from "react";

const PHASES = [
  {
    w: "W01",
    title: "Core Platform",
    state: "ACTIVE",
    items: ["Homepage + Dashboard UI", "Auth + Login system", "PostgreSQL schema online"],
  },
  {
    w: "W02",
    title: "Sensor & Sky",
    state: "QUEUED",
    items: ["Weather APIs (NOAA / OWM)", "Mapbox field rendering", "Sentinel-2 overlays"],
  },
  {
    w: "W03",
    title: "AQAS Assistant",
    state: "QUEUED",
    items: ["Recommendation engine", "Operational alerting", "LangChain agent quorum"],
  },
  {
    w: "W04",
    title: "Ariah + CRM",
    state: "QUEUED",
    items: ["CRM // pipeline", "Contracts + Stripe", "Autonomous outreach loop"],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="relative border-b border-slate-800 bg-[#08090b]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 06</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">DEPLOYMENT WAYPOINTS</span>
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
          Phased rollout. <span className="text-amber-400">No vapor.</span>
        </h2>

        <div className="mt-12 grid lg:grid-cols-4 gap-0 border border-slate-800">
          {PHASES.map((p, i) => (
            <div
              key={p.w}
              data-testid={`phase-${p.w}`}
              className={`relative p-6 lg:p-8 border-b lg:border-b-0 ${i < PHASES.length - 1 ? "lg:border-r" : ""} border-slate-800`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-amber-400 text-xs tracking-[0.3em]">{p.w}</div>
                <span
                  className={`text-[10px] uppercase tracking-[0.24em] px-2 py-0.5 border ${
                    p.state === "ACTIVE"
                      ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/10"
                      : "border-slate-700 text-slate-400"
                  }`}
                >
                  {p.state}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-black uppercase tracking-tight text-white">
                {p.title}
              </h3>
              <ul className="mt-5 space-y-2">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="mt-2 h-1 w-1 bg-amber-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              {/* progress bar */}
              <div className="mt-8">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2">progress</div>
                <div className="h-1 bg-slate-900 border border-slate-800">
                  <div
                    className={`h-full ${p.state === "ACTIVE" ? "bg-amber-400" : "bg-slate-700"}`}
                    style={{ width: p.state === "ACTIVE" ? "62%" : "0%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
