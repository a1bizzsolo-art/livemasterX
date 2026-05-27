import React from "react";

const LAYERS = [
  { id: "L0", k: "USER", v: "Operator / Client Console", desc: "Web + mobile command surface." },
  { id: "L1", k: "FRONTEND", v: "Next.js // React Native", desc: "Tactical UI, real-time bindings." },
  { id: "L2", k: "API LAYER", v: "FastAPI // Supabase Edge", desc: "Auth, routing, contracts." },
  { id: "L3", k: "AI SERVICES + DB", v: "AQAS // Ariah // Pluto + PostgreSQL", desc: "10^4 agent swarm, vector + relational." },
  { id: "L4", k: "DATA SOURCES", v: "Sentinel Hub // Earth Engine // NOAA // OpenWeather", desc: "Satellite, weather, sensor ingestion." },
  { id: "L5", k: "AUTOMATION", v: "n8n // Stripe // Apollo // Instantly", desc: "Workflows, billing, outreach, fulfillment." },
];

export default function Architecture() {
  return (
    <section id="architecture" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 04</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
          Six layers. <span className="text-amber-400">One autonomous loop.</span>
        </h2>

        <div className="mt-12 border border-slate-800">
          {LAYERS.map((l, i) => (
            <div
              key={l.id}
              data-testid={`arch-${l.id}`}
              className="grid grid-cols-12 items-stretch border-b last:border-b-0 border-slate-800 group hover:bg-amber-500/[0.03] transition-colors"
            >
              <div className="col-span-2 lg:col-span-1 border-r border-slate-800 px-4 py-5 flex items-center justify-center">
                <span className="font-mono text-amber-400 text-sm tracking-widest">{l.id}</span>
              </div>
              <div className="col-span-10 lg:col-span-3 border-r border-slate-800 px-5 py-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Layer</div>
                <div className="font-display text-base font-bold uppercase tracking-tight">{l.k}</div>
              </div>
              <div className="col-span-12 lg:col-span-5 border-t lg:border-t-0 lg:border-r border-slate-800 px-5 py-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Stack</div>
                <div className="font-mono text-xs text-white">{l.v}</div>
              </div>
              <div className="col-span-12 lg:col-span-3 border-t lg:border-t-0 border-slate-800 px-5 py-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Function</div>
                <div className="text-xs text-slate-400">{l.desc}</div>
              </div>

              {i < LAYERS.length - 1 && (
                <div className="col-span-12 flex items-center justify-center border-t border-slate-800 py-2 text-amber-400/70 text-xs">
                  ▼
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AQAS code snippet */}
        <div className="mt-12 grid lg:grid-cols-12 gap-0 border border-slate-800">
          <div className="lg:col-span-5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">// REFERENCE IMPL</div>
            <h3 className="mt-3 font-display text-2xl font-black uppercase tracking-tight">How AQAS thinks.</h3>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              A canonical reasoning loop: ingest, fuse, decide, dispatch. Every decision is signed,
              versioned, and explainable down to the agent quorum that produced it.
            </p>
          </div>
          <div className="lg:col-span-7 bg-[#08090b]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-black/40">
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">aqas/core.py</span>
              <span className="text-[10px] font-mono text-emerald-400">verified</span>
            </div>
            <pre className="p-6 text-[12px] leading-6 text-slate-300 font-mono">
{`class AQAS:
    def analyze(self, field):
        weather   = `}<span className="text-amber-400">{`get_weather`}</span>{`(field)
        moisture  = `}<span className="text-amber-400">{`get_soil_data`}</span>{`(field)
        satellite = `}<span className="text-amber-400">{`get_satellite_analysis`}</span>{`(field)

        return `}<span className="text-emerald-400">{`generate_irrigation_strategy`}</span>{`(
            weather,
            moisture,
            satellite,
            agents=`}<span className="text-white">{`10_000`}</span>{`,
        )`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
