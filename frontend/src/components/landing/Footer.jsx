import React from "react";
import { Crosshair } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-testid="site-footer" className="border-t border-slate-800 bg-[#08090b]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-12 gap-8 border-b border-slate-800 pb-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center border border-amber-500/60 bg-amber-500/10">
                <Crosshair className="h-4 w-4 text-amber-400" strokeWidth={2.4} />
              </div>
              <div>
                <div className="font-display text-base font-black tracking-tight">
                  A1A1 <span className="text-amber-400">(AQAS)</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  E.I.R Technology // Quantum Operational Intelligence
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-xs leading-relaxed text-slate-400">
              A1A1 (AQAS) is a trademark of Duane Clevenger E.I.R Technology. Defense-grade
              operational intelligence for the next generation of autonomous agriculture.
            </p>
          </div>

          <FooterCol
            title="SYSTEMS"
            items={[
              ["AQAS Assistant", "systems"],
              ["Ariah Sales", "ariah"],
              ["Live Feed", "live"],
              ["Efficiency", "outcomes"],
              ["Pricing", "pricing"],
              ["Roadmap", "roadmap"],
            ]}
          />
          <FooterCol
            title="CHANNELS"
            items={[
              ["Waitlist", "waitlist"],
              ["Status", "top"],
            ]}
          />
          <FooterCol
            title="LEGAL"
            items={[
              ["Terms", "top"],
              ["Privacy", "top"],
              ["Trademark", "top"],
            ]}
          />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 text-[10px] uppercase tracking-[0.22em] text-slate-500">
          <div data-testid="footer-tm">
            © {year} A1A1 (AQAS) — Trademark branded by Duane Clevenger E.I.R Technology. All rights reserved.
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
            <span>Channel secure • build v0.1.0-alpha</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  const scroll = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div className="lg:col-span-2">
      <div className="text-[10px] uppercase tracking-[0.28em] text-amber-400">{title}</div>
      <ul className="mt-4 space-y-2">
        {items.map(([label, id]) => (
          <li key={label}>
            <button
              onClick={() => scroll(id)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
