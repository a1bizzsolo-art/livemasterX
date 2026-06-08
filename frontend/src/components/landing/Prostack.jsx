import React from "react";
import { ArrowRight, Droplets, Crosshair, Link2 } from "lucide-react";

// Placeholder URL — update once Prostack is live.
const PROSTACK_URL = "#";

export default function Prostack() {
  return (
    <section id="prostack" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-0 border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.06] to-transparent">
          {/* Left — Prostack badge */}
          <div className="lg:col-span-5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-amber-500/40">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center border border-amber-500/60 bg-amber-500/10">
                <Droplets className="h-4 w-4 text-amber-400" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-amber-400">
                  IRRIGATION PROSTACK
                </div>
                <div className="font-display text-base font-bold uppercase tracking-tight text-white">
                  Execution arm. Pipes, valves, pumps.
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-300 leading-relaxed">
              Prostack puts AQAS's brain into the field. The same orbital intelligence
              you see here automatically dispatches to your Prostack-installed
              irrigation infrastructure — zone valves, variable-rate pivots, drip lines.
            </p>
          </div>

          {/* Right — bridge */}
          <div className="lg:col-span-7 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-10 w-10 place-items-center border border-slate-700 bg-[#0c0e12]">
                <Crosshair className="h-4 w-4 text-amber-400" strokeWidth={2.4} />
              </div>
              <Link2 className="h-3.5 w-3.5 text-amber-400" />
              <div className="grid h-10 w-10 place-items-center border border-amber-500/60 bg-amber-500/10">
                <Droplets className="h-4 w-4 text-amber-400" strokeWidth={2.4} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                AQAS ⟷ PROSTACK
              </div>
            </div>

            <h3 className="font-display text-2xl lg:text-3xl font-black uppercase tracking-tighter">
              One stack. <span className="text-amber-400">Two products.</span> One cart.
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Bundle AQAS (intelligence) with Irrigation Prostack (execution) for the
              full operational loop — orbital sensing to field actuation in under 60 seconds.
              Existing Prostack customers unlock a permanent <span className="text-amber-400">15% discount</span> on every AQAS tier.
            </p>

            <div className="mt-6 grid grid-cols-3 border border-slate-800 bg-[#0c0e12]">
              {[
                ["BUNDLE DISCOUNT", "15%"],
                ["INSTALL TIME", "≤ 14d"],
                ["PAYBACK", "≤ 9mo"],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3 border-r last:border-r-0 border-slate-800">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{k}</div>
                  <div className="font-display text-lg font-black text-amber-400">{v}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                data-testid="prostack-link"
                href={PROSTACK_URL}
                target={PROSTACK_URL.startsWith("#") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-amber-500 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 transition-colors"
              >
                Go to Irrigation Prostack
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <button
                data-testid="prostack-bundle-cta"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 border border-slate-700 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                Bundle with AQAS
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
