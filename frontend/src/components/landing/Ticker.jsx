import React from "react";

const ITEMS = [
  "NDVI 0.74", "MOISTURE 18.2%", "AGENTS 10,000+", "SECTOR 04-G LOCKED",
  "ARIAH OUTREACH +312", "CONTRACTS SIGNED 27", "WEATHER NOAA OK", "SENTINEL-2 PASS",
  "PLUTO INDEX 91", "IRRIGATION QUEUED", "AQAS SUMMARY READY", "FLEET // ALL CLEAR",
];

export default function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div data-testid="telemetry-ticker" className="border-b border-slate-800 bg-[#08090b]">
      <div className="overflow-hidden">
        <div className="ticker-track flex whitespace-nowrap py-2.5">
          {row.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-6 text-[11px] uppercase tracking-[0.22em]">
              <span className="h-1 w-1 bg-amber-400" />
              <span className={i % 3 === 0 ? "text-amber-400" : "text-slate-400"}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
