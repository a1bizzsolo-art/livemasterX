import React from "react";
import { Satellite, Layers, Radar, Activity, ScanLine, Globe2 } from "lucide-react";

const SAT_IMG =
  "https://images.unsplash.com/photo-1518126413819-d62b8d22b8f7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxlYXJ0aCUyMHNhdGVsbGl0ZXxlbnwwfHx8fDE3Nzk4Njg2OTN8MA&ixlib=rb-4.1.0&q=85";

const PLATFORMS = [
  {
    icon: Layers,
    name: "SENTINEL-2",
    role: "Multispectral NDVI / NDWI / NDMI",
    spec: "10 m • 13 bands • ≤5d revisit",
  },
  {
    icon: Radar,
    name: "SENTINEL-1",
    role: "C-band SAR — moisture under cloud cover",
    spec: "20 m • all-weather • 6d revisit",
  },
  {
    icon: Activity,
    name: "SENTINEL-3 OLCI",
    role: "Land surface temperature + vegetation",
    spec: "300 m • daily global",
  },
  {
    icon: Globe2,
    name: "SENTINEL-5P",
    role: "Atmospheric trace gases (NO₂, CH₄)",
    spec: "3.5 km • daily • carbon-grade",
  },
];

const INDICES = [
  { k: "NDVI", desc: "Vegetation density", range: "0.65 → 0.84" },
  { k: "NDWI", desc: "Canopy water content", range: "0.18 → 0.32" },
  { k: "NDMI", desc: "Soil + plant moisture", range: "0.12 → 0.27" },
  { k: "SAVI", desc: "Soil-adjusted vegetation", range: "0.52 → 0.71" },
  { k: "LST",  desc: "Land surface temperature", range: "18 → 31 °C" },
  { k: "EVI",  desc: "Enhanced vegetation (dense canopy)", range: "0.41 → 0.69" },
];

export default function Copernicus() {
  return (
    <section id="copernicus" className="relative border-b border-slate-800">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24 relative">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 05</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            COPERNICUS // ESA SATELLITE ANALYTICS
          </span>
        </div>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
            Four satellites. <span className="text-amber-400">One field.</span>
          </h2>
          <p className="max-w-md text-xs text-slate-400 leading-relaxed">
            We fuse the entire Copernicus constellation — optical, radar, thermal, atmospheric —
            into a continuous, per-acre intelligence stream. Cloudy day? Sentinel-1 sees through.
            Night? Sentinel-3 reads heat. Nothing goes dark.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-0 border border-slate-800">
          {/* Image panel */}
          <div className="lg:col-span-5 relative h-[360px] lg:h-auto min-h-[360px] scan-overlay">
            <img src={SAT_IMG} alt="Earth-observation satellite" className="absolute inset-0 h-full w-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-amber-500/10" />
            <div className="radar-sweep" />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-amber-400">
              <div className="flex items-center gap-2">
                <ScanLine className="h-3 w-3" />
                <span>ORBIT TRACK // LIVE</span>
              </div>
              <span className="text-emerald-400">PASS T−02:14</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-black/85 backdrop-blur px-4 py-3">
              <div className="grid grid-cols-3 gap-3 text-[10px] font-mono">
                <div>
                  <div className="text-slate-500 uppercase tracking-[0.18em]">ORBIT</div>
                  <div className="text-amber-400">SSO 786 km</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase tracking-[0.18em]">INCL.</div>
                  <div className="text-amber-400">98.62°</div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase tracking-[0.18em]">SWATH</div>
                  <div className="text-amber-400">290 km</div>
                </div>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2">
            {PLATFORMS.map((p, i) => (
              <div
                key={p.name}
                data-testid={`platform-${p.name.toLowerCase()}`}
                className={`p-6 lg:p-7 border-b border-slate-800 ${i % 2 === 0 ? "sm:border-r" : ""} ${i >= PLATFORMS.length - 2 ? "sm:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center border border-amber-500/50 bg-amber-500/5">
                    <p.icon className="h-4 w-4 text-amber-400" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.22em] text-slate-500">ESA</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-tight text-white">
                  {p.name}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{p.role}</p>
                <div className="mt-4 text-[10px] font-mono text-amber-400">{p.spec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Indices table */}
        <div className="mt-10 border border-slate-800">
          <div className="px-5 py-3 border-b border-slate-800 bg-black/40 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">// Vegetation + Water Indices Computed Per-Acre</div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-emerald-400">
              <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
              <span>STREAMING</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3">
            {INDICES.map((idx, i) => (
              <div
                key={idx.k}
                data-testid={`index-${idx.k.toLowerCase()}`}
                className={`px-5 py-5 border-b border-r border-slate-800 ${
                  (i + 1) % 2 === 0 ? "border-r-0 lg:border-r" : ""
                } ${(i + 1) % 3 === 0 ? "lg:border-r-0" : ""} ${i >= INDICES.length - 3 ? "lg:border-b-0" : ""} ${i >= INDICES.length - 2 ? "border-b-0 lg:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-black tracking-tight text-amber-400">{idx.k}</div>
                  <Satellite className="h-3 w-3 text-slate-500" />
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{idx.desc}</div>
                <div className="mt-3 text-[10px] font-mono text-emerald-400">{idx.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
