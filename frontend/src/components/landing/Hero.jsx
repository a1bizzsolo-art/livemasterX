import React from "react";
import { ArrowRight, Activity, Satellite, Radar, Cpu } from "lucide-react";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/89ebfdf8-4335-43e7-a10b-95be04465ba1/images/da709a771792e50d5a31f39d3fa2e5277aae9a5ed8e2a0be8add53690023686c4.png";
const HERO_IMG_FALLBACK =
  "https://static.prod-images.emergentagent.com/jobs/89ebfdf8-4335-43e7-a10b-95be04465ba1/images/da709a71792e50d5a31f39d3fa2e5277aae9a5ed8e2a0be8add53690023686c4.png";

export default function Hero({ stats }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="top" className="relative border-b border-slate-800">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 lg:py-16">
        {/* Status strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-800 mb-10">
          {[
            ["// SYS", "AQAS // ARIAH // PLUTO"],
            ["// MODE", "AUTONOMOUS"],
            ["// CHANNEL", "10^4 AGENTS"],
            ["// CLEARANCE", "TIER-IV"],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-3 border-r last:border-r-0 border-slate-800">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{k}</div>
              <div className="text-xs text-amber-400 font-mono mt-1">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-0 border border-slate-800">
          {/* Left — copy */}
          <div className="lg:col-span-7 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-2 w-2 bg-amber-400 pulse-amber" />
              <span className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
                Operational Intelligence // Live Feed
              </span>
            </div>

            <h1
              data-testid="hero-headline"
              className="font-display text-4xl sm:text-5xl lg:text-[5.5rem] font-black leading-[0.92] tracking-tighter uppercase text-white"
            >
              10,000 <br />
              <span className="text-amber-400">AI agents.</span>
              <br />
              Zero blind spots.
            </h1>

            <p className="mt-8 max-w-xl text-sm leading-relaxed text-slate-400">
              <span className="text-white">A1A1 (AQAS)</span> is defense-grade operational
              intelligence for precision agriculture. Powered by 10 to the 4th power of agents —
              continuously fusing satellite, weather, sensor and ground-truth telemetry into a
              single autonomous command surface.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                data-testid="hero-cta-primary"
                onClick={() => scrollTo("waitlist")}
                className="group inline-flex items-center justify-center gap-2 bg-amber-500 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-amber-400 transition-colors"
              >
                Everything Overstep of Ariah
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                data-testid="hero-cta-secondary"
                onClick={() => scrollTo("live")}
                className="inline-flex items-center justify-center gap-2 border border-slate-700 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                See Live Field
              </button>
            </div>

            {/* Live KPI row */}
            <div className="mt-12 grid grid-cols-3 border border-slate-800">
              {[
                {
                  k: "Agents online",
                  v: stats.agents_online.toLocaleString(),
                  i: <Cpu className="h-3.5 w-3.5" />,
                },
                {
                  k: "Fields watched",
                  v: stats.fields_under_watch.toLocaleString(),
                  i: <Satellite className="h-3.5 w-3.5" />,
                },
                { k: "Uptime", v: stats.uptime, i: <Activity className="h-3.5 w-3.5" /> },
              ].map((s) => (
                <div
                  key={s.k}
                  data-testid={`hero-kpi-${s.k.replace(/\s+/g, "-").toLowerCase()}`}
                  className="px-5 py-4 border-r last:border-r-0 border-slate-800"
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                    {s.i}
                    <span>{s.k}</span>
                  </div>
                  <div className="mt-2 font-display text-2xl font-black text-white">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — satellite NDVI panel */}
          <div className="lg:col-span-5 relative bg-[#0c0e12]">
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-slate-400 z-20">
              <div className="flex items-center gap-2">
                <Radar className="h-3 w-3 text-amber-400" />
                <span>NDVI // Sector 04-G</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
                <span>Live</span>
              </div>
            </div>

            <div className="relative h-[420px] lg:h-full min-h-[420px] scan-overlay">
              <img
                src={HERO_IMG_FALLBACK}
                onError={(e) => {
                  e.currentTarget.src = HERO_IMG;
                }}
                alt="NDVI satellite view of agricultural fields"
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-amber-500/10" />
              <div className="radar-sweep" />

              {/* corner crosshairs */}
              {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
                (pos, i) => (
                  <div key={i} className={`absolute ${pos} z-10`}>
                    <div className="h-4 w-4 border-t-2 border-l-2 border-amber-400" />
                  </div>
                )
              )}

              {/* readout strip */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-black/85 backdrop-blur px-4 py-3 z-20">
                <div className="grid grid-cols-3 gap-3 text-[10px] font-mono">
                  <div>
                    <div className="text-slate-500 uppercase tracking-[0.18em]">LAT</div>
                    <div className="text-amber-400">36.7783° N</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase tracking-[0.18em]">LON</div>
                    <div className="text-amber-400">-119.4179° W</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase tracking-[0.18em]">NDVI μ</div>
                    <div className="text-emerald-400">0.742 // healthy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
