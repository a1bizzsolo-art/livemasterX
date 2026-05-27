import React from "react";
import { Brain, Droplets, BellRing, BarChart3, Satellite, CloudRain } from "lucide-react";

const THERMAL =
  "https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx0aGVybWFsJTIwbWFwJTIwYWdyaWN1bHR1cmV8ZW58MHx8fHwxNzc5ODY4NjkzfDA&ixlib=rb-4.1.0&q=85";

const CAPS = [
  { icon: Brain, k: "AQAS-001", title: "Recommendations", desc: "Fused satellite + ground truth advisories with risk-weighted action paths." },
  { icon: Droplets, k: "AQAS-002", title: "Irrigation Planning", desc: "Per-zone schedules optimized against ET, NDVI delta and forecast windows." },
  { icon: BellRing, k: "AQAS-003", title: "Operational Alerts", desc: "Thermal anomaly, frost, blight and equipment failure tripwires." },
  { icon: BarChart3, k: "AQAS-004", title: "Analytics Summaries", desc: "Daily ops briefings in 90 seconds — exec-ready, audit-grade." },
  { icon: Satellite, k: "AQAS-005", title: "Satellite Intelligence", desc: "Sentinel Hub + Earth Engine — NDVI, moisture zones, crop health." },
  { icon: CloudRain, k: "AQAS-006", title: "Weather Engine", desc: "OpenWeatherMap + NOAA hourly resolution, irrigation-grade precision." },
];

export default function Systems() {
  return (
    <section id="systems" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <SectionHeader index="01" label="AQAS // CAPABILITIES MATRIX" title="The assistant that doesn’t sleep." />

        <div className="mt-10 grid lg:grid-cols-12 gap-0 border border-slate-800">
          {/* Terminal preview */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0c0e12]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-black/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-red-500/80" />
                <span className="h-2 w-2 bg-amber-400/80" />
                <span className="h-2 w-2 bg-emerald-400/80" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">aqas@bridge ~ %</div>
            </div>
            <pre className="p-5 text-[11.5px] leading-6 text-slate-300 font-mono whitespace-pre-wrap">
{`> aqas analyze --field "north-pivot-04"

[ok] sentinel-2 pass ingested        :: 04:12 UTC
[ok] noaa forecast cached            :: 04:13 UTC
[ok] soil moisture probes            :: 18 / 18
[ok] sensor health                   :: nominal

reasoning:
  ndvi(μ) ............ 0.742 (-0.03 vs 7d)
  moisture(μ) ........ 18.2% (zone 3 below 14%)
  et(forecast 48h) ... 6.8 mm
  precip(forecast) ... 0.4 mm — insufficient

`}<span className="text-amber-400">{`recommendation:
  irrigate zone-3 @ 11mm — window 02:00-04:00 LT
  defer zone-1/2 — moisture sufficient (+3.1d buffer)
  flag thermal hotspot @ N36.7783 / W-119.4179`}</span>{`

confidence ............ 0.94  ::  agents quorum 8,742
dispatch -> n8n://ops/irrigate-zone-3
`}<span className="blink text-emerald-400">_</span>
            </pre>
          </div>

          {/* Capabilities grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2">
            {CAPS.map(({ icon: Icon, k, title, desc }, i) => (
              <div
                key={k}
                data-testid={`cap-${k}`}
                className={`relative p-6 lg:p-7 border-b sm:[&:nth-child(odd)]:border-r border-slate-800 ${i >= CAPS.length - 2 ? "sm:[&:nth-last-child(-n+2)]:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center border border-amber-500/50 bg-amber-500/5">
                    <Icon className="h-4 w-4 text-amber-400" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.22em] text-slate-500">{k}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-tight text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Thermal preview band */}
        <div className="mt-10 grid lg:grid-cols-12 gap-0 border border-slate-800">
          <div className="lg:col-span-7 relative h-[280px] lg:h-auto scan-overlay">
            <img src={THERMAL} alt="Thermal field overlay" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.24em] text-amber-400">
              MOISTURE ZONE OVERLAY // SENTINEL-2 L2A
            </div>
          </div>
          <div className="lg:col-span-5 p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0c0e12]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">// 02 — SATELLITE INTEL</div>
            <h3 className="mt-3 font-display text-2xl lg:text-3xl font-black uppercase tracking-tight">NDVI. Moisture. Crop health. Per acre.</h3>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Continuous Sentinel-2 and Google Earth Engine fusion. Sub-meter overlays piped into the AQAS reasoning core every revisit cycle.
            </p>
            <div className="mt-6 grid grid-cols-3 border border-slate-800">
              {[["REVISIT", "≤ 5d"], ["RES.", "10 m"], ["BANDS", "13"]].map(([k,v]) => (
                <div key={k} className="px-3 py-3 border-r last:border-r-0 border-slate-800">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{k}</div>
                  <div className="font-display text-lg font-black text-amber-400">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ index, label, title }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-amber-400">// {index}</span>
        <span className="h-px flex-1 bg-slate-800" />
        <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{label}</span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">{title}</h2>
    </div>
  );
}
