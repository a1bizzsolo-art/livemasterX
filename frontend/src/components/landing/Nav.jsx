import React, { useEffect, useState } from "react";
import { Crosshair, ChevronRight } from "lucide-react";

export default function Nav() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utc = time.toISOString().replace("T", " ").slice(0, 19);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="top-nav"
      className="sticky top-0 z-50 border-b border-slate-800 bg-black/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          <button
            data-testid="brand-logo"
            onClick={() => scrollTo("top")}
            className="flex items-center gap-3 group"
          >
            <div className="grid h-9 w-9 place-items-center border border-amber-500/60 bg-amber-500/10">
              <Crosshair className="h-4 w-4 text-amber-400" strokeWidth={2.4} />
            </div>
            <div className="text-left leading-tight">
              <div className="font-display text-sm font-black tracking-tight text-white">
                A1A1 <span className="text-amber-400">(AQAS)</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                E.I.R Technology
              </div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            {[
              ["systems", "Systems"],
              ["live", "Live Feed"],
              ["copernicus", "Copernicus"],
              ["prostack", "Prostack"],
              ["revenue-stack", "Revenue"],
              ["pricing", "Pricing"],
            ].map(([id, label]) => (
              <button
                key={id}
                data-testid={`nav-${id}`}
                onClick={() => scrollTo(id)}
                className="px-3 py-2 hover:text-amber-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 border border-slate-800 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-400">
              <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
              <span>UTC {utc}</span>
            </div>
            <button
              data-testid="nav-cta-waitlist"
              onClick={() => scrollTo("waitlist")}
              className="group inline-flex items-center gap-2 bg-amber-500 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-black hover:bg-amber-400 transition-colors"
            >
              Initiate Sequence
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
