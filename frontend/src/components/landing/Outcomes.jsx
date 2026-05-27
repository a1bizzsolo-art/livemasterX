import React from "react";
import { Droplets, Sprout, Clock, Leaf, TrendingUp, Zap } from "lucide-react";

const OUTCOMES = [
  { icon: Droplets, value: "32%", label: "Water saved", desc: "Per-zone irrigation cuts blanket watering on every field." },
  { icon: Sprout, value: "+18%", label: "Yield uplift", desc: "Stress events caught before they become losses." },
  { icon: Clock, value: "14h/wk", label: "Operator hours reclaimed", desc: "Daily 90-second briefings replace manual scouting." },
  { icon: Leaf, value: "−24%", label: "Inputs reduced", desc: "Fertilizer + chemicals applied only where the satellite says they’re needed." },
  { icon: TrendingUp, value: "94%", label: "Decision confidence", desc: "Every action backed by a quorum of agents — not a guess." },
  { icon: Zap, value: "<60s", label: "Telemetry latency", desc: "From orbit and ground sensors to your console." },
];

const PILLARS = [
  {
    k: "PRECISION",
    title: "Per-acre, not per-field.",
    body: "Sub-meter satellite overlays mean you irrigate, fertilize and harvest the right ten square meters — not the wrong thousand.",
  },
  {
    k: "AUTONOMY",
    title: "The grid runs itself.",
    body: "10,000 agents continuously fuse satellite, weather and sensor data, then dispatch actions through your existing equipment.",
  },
  {
    k: "EXPLAINABLE",
    title: "Every call shows its work.",
    body: "Each recommendation is signed, versioned and traceable back to the data that produced it. Audit-grade by default.",
  },
];

export default function Outcomes() {
  return (
    <section id="outcomes" className="relative border-b border-slate-800 bg-[#08090b]">
      <div className="absolute inset-0 grid-bg-dense opacity-40 pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24 relative">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 05</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            EFFICIENCY // THE FUTURE OF FARMING
          </span>
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
          Less water. <span className="text-amber-400">More crop.</span> Zero guesswork.
        </h2>
        <p className="mt-5 max-w-2xl text-sm text-slate-400 leading-relaxed">
          AQAS isn't a dashboard. It's the autonomous layer that turns satellite, weather and
          sensor signal into the right action — at the right zone, in the right minute. Efficiency
          is the product.
        </p>

        {/* Outcome tiles */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 border border-slate-800">
          {OUTCOMES.map((o, i) => (
            <div
              key={o.label}
              data-testid={`outcome-${o.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`p-6 lg:p-8 border-b border-r border-slate-800 ${(i + 1) % 2 === 0 ? "border-r-0 lg:border-r" : ""} ${(i + 1) % 3 === 0 ? "lg:border-r-0" : ""} ${i >= OUTCOMES.length - 3 ? "lg:border-b-0" : ""} ${i >= OUTCOMES.length - 2 ? "border-b-0 lg:border-b-0" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center border border-amber-500/50 bg-amber-500/5">
                  <o.icon className="h-4 w-4 text-amber-400" strokeWidth={2} />
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{o.label}</div>
              </div>
              <div className="mt-5 font-display text-4xl lg:text-5xl font-black tracking-tighter text-white">
                {o.value}
              </div>
              <p className="mt-3 text-[12px] text-slate-400 leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>

        {/* Pillars */}
        <div className="mt-14 grid lg:grid-cols-3 border border-slate-800">
          {PILLARS.map((p, i) => (
            <div
              key={p.k}
              className={`p-7 lg:p-8 border-b lg:border-b-0 ${i < PILLARS.length - 1 ? "lg:border-r" : ""} border-slate-800`}
            >
              <div className="text-[10px] font-mono tracking-[0.28em] text-amber-400">// {p.k}</div>
              <h3 className="mt-4 font-display text-xl lg:text-2xl font-bold uppercase tracking-tight text-white">
                {p.title}
              </h3>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
