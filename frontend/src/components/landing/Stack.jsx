import React from "react";

const STACK = [
  { k: "FRONTEND", name: "Next.js", role: "App shell + SSR" },
  { k: "STYLE", name: "Tailwind + shadcn", role: "Tactical UI primitives" },
  { k: "BACKEND", name: "Supabase", role: "Auth // PG // Realtime" },
  { k: "AI", name: "OpenAI + LangChain", role: "Agent reasoning" },
  { k: "MAPS", name: "Mapbox", role: "Field rendering" },
  { k: "SATELLITE", name: "Sentinel Hub", role: "NDVI // L2A" },
  { k: "SATELLITE", name: "Earth Engine", role: "Time-series fusion" },
  { k: "WEATHER", name: "OpenWeatherMap", role: "Hourly precip / ET" },
  { k: "WEATHER", name: "NOAA", role: "Authoritative forecast" },
  { k: "AUTOMATION", name: "n8n", role: "Workflows + dispatch" },
  { k: "PAYMENTS", name: "Stripe", role: "Subscriptions + invoicing" },
  { k: "HOSTING", name: "Vercel", role: "Edge deployment" },
];

export default function Stack() {
  return (
    <section id="stack" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 05</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">BUILD STACK // OPERATIONAL ARSENAL</span>
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
          Best-of-breed. Hardened. <span className="text-amber-400">Shipping.</span>
        </h2>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border border-slate-800">
          {STACK.map((s, i) => (
            <div
              key={s.name}
              data-testid={`stack-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`group relative p-6 border-b border-r border-slate-800 hover:bg-amber-500/[0.04] transition-colors
                ${(i + 1) % 4 === 0 ? "lg:border-r-0" : ""}
                ${(i + 1) % 3 === 0 ? "md:border-r-0 lg:border-r" : ""}
                ${(i + 1) % 2 === 0 ? "border-r-0 md:border-r" : ""}
                ${i >= STACK.length - 4 ? "lg:border-b-0" : ""}
              `}
            >
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{s.k}</div>
              <div className="mt-2 font-display text-xl font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {s.name}
              </div>
              <div className="mt-3 text-[11px] font-mono text-slate-400">{s.role}</div>
              <div className="absolute top-3 right-3 h-1.5 w-1.5 bg-amber-400/0 group-hover:bg-amber-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
