import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Check, ArrowRight, Loader2, TrendingDown, Lock, Satellite } from "lucide-react";

const TERM_FEATURES = {
  1:  ["Cancel after season", "Standard satellite cadence", "Email + dashboard alerts"],
  3:  ["10% discount locked", "Priority satellite cadence", "Quarterly ops review", "Ariah outreach hooks"],
  5:  ["18% discount locked", "Daily Copernicus pass priority", "Dedicated agent quorum", "Custom KPI dashboards", "Annual on-site briefing"],
  10: ["28% discount locked", "Full Copernicus + Sentinel-1 fusion", "Top-priority orbital tasking", "SLA 99.99%", "On-call ops engineer", "Co-development roadmap"],
};

export default function Pricing({ api }) {
  const [cfg, setCfg] = useState(null);
  const [stats, setStats] = useState({ count: 0, revenue: 0, currency: "USD", recent: [] });
  const [acres, setAcres] = useState(2500);
  const [years, setYears] = useState(5);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${api}/pricing`).then((r) => setCfg(r.data)).catch(() => {});
    axios.get(`${api}/deals/stats`).then((r) => setStats(r.data)).catch(() => {});
  }, [api]);

  const quote = useMemo(() => {
    if (!cfg) return null;
    const term = cfg.terms.find((t) => t.years === years) || cfg.terms[0];
    const annualTotal = acres * term.rate_per_acre;
    const contractTotal = annualTotal * years;
    const marketTotal = acres * cfg.market_rate_per_acre * years;
    const savings = marketTotal - contractTotal;
    return {
      term,
      annualPerAcre: term.rate_per_acre,
      annualTotal,
      contractTotal,
      marketTotal,
      savings,
    };
  }, [cfg, acres, years]);

  const handleCheckout = async () => {
    if (submitting || !cfg) return;
    setSubmitting(true);
    try {
      const payload = { acres, years, origin_url: window.location.origin };
      if (email.trim()) payload.customer_email = email.trim();
      const r = await axios.post(`${api}/checkout/session`, payload);
      if (r.data?.url) window.location.href = r.data.url;
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  const fmt = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <section id="pricing" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 06</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            PRICING // PER ACRE // {cfg?.savings_pct_vs_market ?? "30"}% UNDER MARKET
          </span>
        </div>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
            Pay per acre. <span className="text-amber-400">Save by year.</span>
          </h2>
          <div data-testid="revenue-counter" className="border border-slate-800 bg-[#0c0e12] min-w-[260px]">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Closed Deals // Live</span>
              <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-800">
              <div className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Revenue</div>
                <div className="font-display text-2xl font-black text-amber-400">{fmt(stats.revenue)}</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Deals</div>
                <div className="font-display text-2xl font-black text-white">{stats.count}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Market comparison strip */}
        <div className="mt-10 grid grid-cols-3 border border-slate-800">
          <Strip k="Market avg" v={`$${cfg?.market_rate_per_acre ?? "6.00"}`} sub="/ acre / year" tone="text-slate-300" />
          <Strip k="A1A1 (AQAS) list" v={`$${cfg?.base_rate_per_acre ?? "4.20"}`} sub="/ acre / year • 1y" tone="text-amber-400" />
          <Strip k="10-year locked" v={`$${cfg?.terms?.[3]?.rate_per_acre ?? "3.02"}`} sub="/ acre / year • 10y" tone="text-emerald-400" />
        </div>

        {/* Calculator */}
        <div className="mt-10 grid lg:grid-cols-12 gap-0 border border-slate-800 bg-[#0c0e12]">
          {/* Left — inputs */}
          <div className="lg:col-span-5 p-7 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400">// CONFIGURE</div>

            {/* Acreage */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Acreage</label>
                <input
                  data-testid="acres-input"
                  type="number"
                  min={cfg?.min_acres ?? 50}
                  max={cfg?.max_acres ?? 10000000}
                  value={acres}
                  onChange={(e) => setAcres(Math.max(50, Math.min(10000000, Number(e.target.value) || 0)))}
                  className="w-32 text-right bg-transparent border-b border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-1"
                />
              </div>
              <input
                data-testid="acres-slider"
                type="range"
                min={100}
                max={50000}
                step={50}
                value={Math.min(50000, acres)}
                onChange={(e) => setAcres(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>100</span><span>10k</span><span>50k+</span>
              </div>
            </div>

            {/* Term */}
            <div className="mt-8">
              <label className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Contract length</label>
              <div className="mt-3 grid grid-cols-4 gap-0 border border-slate-800">
                {(cfg?.terms || []).map((t) => {
                  const active = t.years === years;
                  return (
                    <button
                      key={t.years}
                      data-testid={`term-${t.years}y`}
                      onClick={() => setYears(t.years)}
                      className={`px-2 py-3 text-center border-r last:border-r-0 border-slate-800 transition-colors ${
                        active ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="font-display text-lg font-black">{t.years}y</div>
                      <div className="text-[9px] uppercase tracking-[0.18em] opacity-80">
                        {t.discount_pct ? `−${t.discount_pct}%` : "list"}
                      </div>
                    </button>
                  );
                })}
              </div>
              {quote?.term && (
                <div className="mt-3 text-[11px] font-mono text-slate-400">
                  <span className="text-amber-400">{quote.term.name}</span> — {quote.term.tagline}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mt-8">
              <label className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Contact email (optional)</label>
              <input
                data-testid="pricing-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@field.io"
                className="mt-2 w-full bg-transparent border-0 border-b border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Right — quote */}
          <div className="lg:col-span-7 p-7 lg:p-10">
            <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400">// QUOTE</div>

            <div className="mt-6 grid grid-cols-2 border border-slate-800">
              <QuoteCell k="Per acre / year" v={quote ? `$${quote.annualPerAcre.toFixed(2)}` : "—"} sub={`${years}-year term`} />
              <QuoteCell k="Annual cost" v={quote ? fmt(quote.annualTotal) : "—"} sub={`${acres.toLocaleString()} acres`} />
              <QuoteCell
                k="Contract total"
                v={quote ? fmt(quote.contractTotal) : "—"}
                sub={`over ${years} year${years > 1 ? "s" : ""}`}
                large
                tone="text-amber-400"
                testid="quote-contract-total"
              />
              <QuoteCell
                k="Savings vs market"
                v={quote ? `−${fmt(quote.savings)}` : "—"}
                sub={`@ $${cfg?.market_rate_per_acre ?? 6}/acre baseline`}
                large
                tone="text-emerald-400"
                testid="quote-savings"
              />
            </div>

            {/* What's included */}
            <div className="mt-6 border border-slate-800">
              <div className="px-4 py-2.5 border-b border-slate-800 bg-black/40 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                Included at this term
              </div>
              <ul className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Copernicus Sentinel-2 NDVI overlays",
                  "Soil moisture + ET telemetry (live)",
                  "AQAS daily ops briefings",
                  "Multi-channel alerts (email + SMS)",
                  ...(TERM_FEATURES[years] || []),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 flex items-center gap-2">
                <Lock className="h-3 w-3 text-amber-400" />
                Rate locked for full term • {cfg?.mode === "live" ? <span className="text-red-400">LIVE PAYMENTS</span> : <span className="text-emerald-400">SANDBOX</span>}
              </div>
              <button
                data-testid="checkout-cta"
                onClick={handleCheckout}
                disabled={submitting}
                className="group inline-flex items-center justify-center gap-2 bg-amber-500 px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 disabled:opacity-60 transition-colors w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Routing to Stripe…
                  </>
                ) : (
                  <>
                    Activate {quote?.term?.name || ""} — {quote ? fmt(quote.contractTotal) : ""}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tiers strip */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-slate-800">
          {(cfg?.terms || []).map((t, i) => {
            const active = t.years === years;
            return (
              <button
                key={t.years}
                onClick={() => setYears(t.years)}
                className={`text-left p-5 border-b border-r border-slate-800 ${i === 1 ? "" : ""} ${i >= 2 ? "lg:border-b-0" : "lg:border-b-0"} ${(i + 1) % 2 === 0 ? "border-r-0 lg:border-r" : ""} ${i === 3 ? "lg:border-r-0" : ""} transition-colors ${
                  active ? "bg-amber-500/10" : "hover:bg-slate-900/40"
                }`}
              >
                <div className={`text-[10px] uppercase tracking-[0.22em] ${active ? "text-amber-400" : "text-slate-500"}`}>
                  {t.years}-year • {t.name}
                </div>
                <div className="mt-2 font-display text-2xl font-black tracking-tight text-white">${t.rate_per_acre}</div>
                <div className="text-[10px] font-mono text-slate-500">/ acre / year</div>
                {t.discount_pct > 0 ? (
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                    <TrendingDown className="h-3 w-3" />
                    −{t.discount_pct}% vs 1-year list
                  </div>
                ) : (
                  <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">flex / season</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Powered by Copernicus banner */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border border-slate-800 bg-[#0c0e12] px-6 py-5">
          <div className="flex items-center gap-3">
            <Satellite className="h-4 w-4 text-amber-400" />
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
              Powered by <span className="text-amber-400">Copernicus Sentinel-2 + Sentinel-1</span> — ESA orbital constellation
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500">Revisit ≤ 5d • Resolution 10m • 13 bands</div>
        </div>

        {/* Recent deals tape */}
        {stats.recent && stats.recent.length > 0 && (
          <div className="mt-10 border border-slate-800">
            <div className="px-5 py-3 border-b border-slate-800 bg-black/40 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              // Last closed deals
            </div>
            <div className="divide-y divide-slate-800">
              {stats.recent.map((d) => (
                <div key={d.id} className="grid grid-cols-12 px-5 py-3 text-xs font-mono items-center">
                  <div className="col-span-3 text-amber-400">{fmt(d.amount)}</div>
                  <div className="col-span-4 text-white uppercase truncate">{d.tier_name}</div>
                  <div className="col-span-3 text-slate-400 truncate">{d.customer_email || d.customer_name || "anonymous"}</div>
                  <div className="col-span-2 text-right text-slate-500">{new Date(d.closed_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Strip({ k, v, sub, tone = "text-white" }) {
  return (
    <div className="px-5 py-4 border-r last:border-r-0 border-slate-800">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{k}</div>
      <div className={`mt-1 font-display text-2xl lg:text-3xl font-black ${tone}`}>{v}</div>
      <div className="text-[10px] font-mono text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function QuoteCell({ k, v, sub, large, tone = "text-white", testid }) {
  return (
    <div data-testid={testid} className="px-5 py-4 border-r [&:nth-child(2n)]:border-r-0 border-b [&:nth-child(n+3)]:border-b-0 border-slate-800">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{k}</div>
      <div className={`mt-1.5 font-display font-black tracking-tighter ${large ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl"} ${tone}`}>{v}</div>
      <div className="text-[10px] font-mono text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
